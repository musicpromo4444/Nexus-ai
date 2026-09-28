package ai.nexus.assistant

import android.content.Context
import android.content.Intent
import android.media.AudioManager
import android.net.Uri
import android.provider.Settings

class NexusDeviceActions(private val context: Context) {
    fun openApp(packageName: String): Boolean = try {
        context.startActivity(context.packageManager.getLaunchIntentForPackage(packageName)?.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
        true
    } catch (_: Exception) { false }

    fun makeCall(number: String): Boolean = try {
        context.startActivity(Intent(Intent.ACTION_CALL, Uri.parse("tel:$number")).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
        true
    } catch (_: Exception) { false }

    fun sendMessage(number: String, message: String): Boolean = try {
        context.startActivity(Intent(Intent.ACTION_SENDTO, Uri.parse("smsto:$number")).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            putExtra("sms_body", message)
        })
        true
    } catch (_: Exception) { false }

    fun mediaPlayPause(): Boolean = try {
        val audio = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
        audio.dispatchMediaKeyEvent(android.view.KeyEvent(android.view.KeyEvent.ACTION_DOWN, android.view.KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE))
        audio.dispatchMediaKeyEvent(android.view.KeyEvent(android.view.KeyEvent.ACTION_UP, android.view.KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE))
        true
    } catch (_: Exception) { false }

    fun openSettings(): Boolean = try {
        context.startActivity(Intent(Settings.ACTION_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
        true
    } catch (_: Exception) { false }
}
