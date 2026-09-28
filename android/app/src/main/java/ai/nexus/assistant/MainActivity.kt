package ai.nexus.assistant

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.provider.Settings
import android.content.Intent
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

class MainActivity : Activity() {
    private val requestCode = 4101
    private val permissions = arrayOf(
        Manifest.permission.RECORD_AUDIO,
        Manifest.permission.POST_NOTIFICATIONS,
        Manifest.permission.READ_CONTACTS,
        Manifest.permission.CALL_PHONE,
        Manifest.permission.SEND_SMS
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        requestCorePermissions()
    }

    private fun requestCorePermissions() {
        val missing = permissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }
        if (missing.isNotEmpty()) {
            ActivityCompat.requestPermissions(this, missing.toTypedArray(), requestCode)
        }
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == this.requestCode && ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
            startVoiceService()
        }
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
