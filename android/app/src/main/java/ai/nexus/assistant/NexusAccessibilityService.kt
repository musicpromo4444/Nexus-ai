package ai.nexus.assistant

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.graphics.Rect
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import android.view.GestureDescription
import android.graphics.Path

class NexusAccessibilityService : AccessibilityService() {
    override fun onServiceConnected() {
        serviceInfo = AccessibilityServiceInfo().apply {
            eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED or AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED
            feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC
            flags = AccessibilityServiceInfo.FLAG_REPORT_VIEW_IDS or AccessibilityServiceInfo.FLAG_RETRIEVE_INTERACTIVE_WINDOWS
            notificationTimeout = 100
        }
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event?.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            val packageName = event.packageName?.toString().orEmpty()
            if (packageName.isNotBlank()) {
                getSharedPreferences("nexus_screen", MODE_PRIVATE).edit()
                    .putString("active_package", packageName).apply()
            }
        }
    }
    override fun onInterrupt() {}

    fun describeScreen(): List<ScreenElement> {
        val root = rootInActiveWindow ?: return emptyList()
        val result = mutableListOf<ScreenElement>()
        collect(root, result)
        return result
    }

    private fun collect(node: AccessibilityNodeInfo, out: MutableList<ScreenElement>) {
        val rect = Rect()
        node.getBoundsInScreen(rect)
        val text = node.text?.toString()?.trim().orEmpty()
        val description = node.contentDescription?.toString()?.trim().orEmpty()
        if (text.isNotEmpty() || description.isNotEmpty() || node.isClickable) {
            out += ScreenElement(
                text = text,
                description = description,
                clickable = node.isClickable,
                x = rect.centerX(),
                y = rect.centerY()
            )
        }
        for (i in 0 until node.childCount) node.getChild(i)?.let { child ->
            collect(child, out)
            child.recycle()
        }
    }

    fun tapCoordinate(x: Float, y: Float): Boolean {
        val path = Path().apply { moveTo(x, y) }
        val gesture = GestureDescription.Builder().addStroke(GestureDescription.StrokeDescription(path, 0, 80)).build()
        return dispatchGesture(gesture, null, null)
    }

    fun scrollForward(): Boolean = rootInActiveWindow?.performAction(AccessibilityNodeInfo.ACTION_SCROLL_FORWARD) == true
    fun scrollBackward(): Boolean = rootInActiveWindow?.performAction(AccessibilityNodeInfo.ACTION_SCROLL_BACKWARD) == true

    fun tapText(target: String): Boolean {
        val root = rootInActiveWindow ?: return false
        return findAndClick(root, target.lowercase())
    }

    private fun findAndClick(node: AccessibilityNodeInfo, target: String): Boolean {
        val haystack = listOf(node.text?.toString(), node.contentDescription?.toString()).filterNotNull().joinToString(" ").lowercase()
        if (node.isClickable && haystack.contains(target)) return node.performAction(AccessibilityNodeInfo.ACTION_CLICK)
        for (i in 0 until node.childCount) node.getChild(i)?.let { child ->
            val clicked = findAndClick(child, target)
            child.recycle()
            if (clicked) return true
        }
        return false
    }
}

data class ScreenElement(val text: String, val description: String, val clickable: Boolean, val x: Int, val y: Int)
