package ai.nexus.assistant

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class NexusBootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Intent.ACTION_BOOT_COMPLETED) return
        val prefs = context.getSharedPreferences("nexus_background", Context.MODE_PRIVATE)
        if (prefs.getBoolean("voice_enabled", false) &&
            androidx.core.content.ContextCompat.checkSelfPermission(context, android.Manifest.permission.RECORD_AUDIO) == android.content.pm.PackageManager.PERMISSION_GRANTED) {
            androidx.core.content.ContextCompat.startForegroundService(context, Intent(context, VoiceAssistantService::class.java))
        }
    }
}
