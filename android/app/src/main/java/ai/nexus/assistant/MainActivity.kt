package ai.nexus.assistant

import android.Manifest
import android.app.Activity
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.provider.Settings
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.webkit.WebSettingsCompat
import androidx.webkit.WebViewFeature
import android.content.Intent
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import android.content.BroadcastReceiver
import android.content.IntentFilter

class MainActivity : Activity() {
    private lateinit var webView: WebView
    private val commandReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: android.content.Context?, intent: Intent?) {
            val command = intent?.getStringExtra("command") ?: return
            getSharedPreferences("nexus_commands", MODE_PRIVATE).edit().putString("last_command", command).apply()
            if (command.contains("\"type\":\"voice_transcript\"")) {
                val text = command.substringAfter("\"text\":\"").substringBeforeLast("\"").replace("\\\"", "\"")
                if (text.startsWith("remind me in ", true)) scheduler.scheduleIn(text.hashCode().toString(), text, 60_000L)
            }
        }
    }

    private val requestCode = 4101
    private val securityPrefs by lazy { getSharedPreferences("nexus_security", MODE_PRIVATE) }
    private lateinit var scheduler: NexusScheduler
    private lateinit var deviceActions: NexusDeviceActions
    private lateinit var accountBridge: NexusAccountBridge
    private val permissions = arrayOf(
        Manifest.permission.RECORD_AUDIO,
        Manifest.permission.POST_NOTIFICATIONS,
        Manifest.permission.READ_CONTACTS,
        Manifest.permission.CALL_PHONE,
        Manifest.permission.SEND_SMS
    )

    private val aiReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: android.content.Context?, intent: Intent?) {
            val response = intent?.getStringExtra("response")
            val error = intent?.getStringExtra("error")
            getSharedPreferences("nexus_ai", MODE_PRIVATE).edit().putString("last_response", response ?: error).apply()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        webView = WebView(this)
        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        webView.settings.mediaPlaybackRequiresUserGesture = false
        webView.webViewClient = WebViewClient()
        webView.addJavascriptInterface(NexusBridge(), "NexusAndroid")
        webView.loadUrl("https://nexus-ai-three-neon.vercel.app/")
        setContentView(webView)

        scheduler = NexusScheduler(this)
        deviceActions = NexusDeviceActions(this)
        accountBridge = NexusAccountBridge(this)
        registerReceiver(commandReceiver, IntentFilter(VoiceAssistantService.ACTION_COMMAND), RECEIVER_NOT_EXPORTED)
        registerReceiver(aiReceiver, IntentFilter(VoiceAssistantService.ACTION_AI_RESPONSE), RECEIVER_NOT_EXPORTED)
        requestCorePermissions()
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) startVoiceService()
    }

    inner class NexusBridge {
        @JavascriptInterface fun platform(): String = "android"
        @JavascriptInterface fun permissions(): String = permissions.joinToString(",") { if (ContextCompat.checkSelfPermission(this@MainActivity, it) == PackageManager.PERMISSION_GRANTED) it else "" }
        @JavascriptInterface fun openApp(packageName: String): Boolean = this@MainActivity.openApp(packageName)
        @JavascriptInterface fun makeCall(number: String): Boolean {
            if (!isSensitiveActionAllowed("make_call")) return false
            return this@MainActivity.makeCall(number)
        }
        @JavascriptInterface fun sendMessage(number: String, message: String): Boolean {
            if (!isSensitiveActionAllowed("send_message")) return false
            return this@MainActivity.sendSms(number, message)
        }
        @JavascriptInterface fun openSettings(): Boolean = this@MainActivity.openSystemSettings()
    }

    private fun requestCorePermissions() {
        val missing = permissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }
        if (missing.isNotEmpty()) {
            ActivityCompat.requestPermissions(this, missing.toTypedArray(), requestCode)
        }
    }

    override fun onDestroy() {
        unregisterReceiver(commandReceiver)
        unregisterReceiver(aiReceiver)
        super.onDestroy()
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == this.requestCode && ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
            startVoiceService()
        }
    }

    fun requestPermissionFor(permission: String) {
        val value = when (permission) {
            "microphone" -> Manifest.permission.RECORD_AUDIO
            "notifications" -> Manifest.permission.POST_NOTIFICATIONS
            "contacts" -> Manifest.permission.READ_CONTACTS
            "phone" -> Manifest.permission.CALL_PHONE
            "messages" -> Manifest.permission.SEND_SMS
            else -> return
        }
        if (ContextCompat.checkSelfPermission(this, value) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, arrayOf(value), requestCode)
        }
    }

    private fun isSensitiveActionAllowed(action: String): Boolean = securityPrefs.getBoolean("allow_$action", false)

    fun setSensitiveActionApproval(action: String, allowed: Boolean) {
        securityPrefs.edit().putBoolean("allow_$action", allowed).apply()
    }

    private fun startVoiceService() {
        val intent = Intent(this, VoiceAssistantService::class.java)
        androidx.core.content.ContextCompat.startForegroundService(this, intent)
    }

    fun openApp(packageName: String): Boolean = try {
        startActivity(packageManager.getLaunchIntentForPackage(packageName))
        true
    } catch (_: Exception) { false }

    fun makeCall(number: String): Boolean = try {
        startActivity(Intent(Intent.ACTION_CALL, Uri.parse("tel:$number")))
        true
    } catch (_: Exception) { false }

    fun sendSms(number: String, message: String): Boolean = try {
        startActivity(Intent(Intent.ACTION_SENDTO, Uri.parse("smsto:$number")).apply {
            putExtra("sms_body", message)
        })
        true
    } catch (_: Exception) { false }

    fun openSystemSettings(): Boolean = try {
        startActivity(Intent(Settings.ACTION_SETTINGS))
        true
    } catch (_: Exception) { false }
}
