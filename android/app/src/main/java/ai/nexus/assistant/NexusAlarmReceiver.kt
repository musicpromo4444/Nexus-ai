package ai.nexus.assistant

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.core.app.NotificationCompat
import android.app.NotificationChannel
import android.app.NotificationManager

class NexusAlarmReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val title = intent.getStringExtra("title") ?: "Nexus reminder"
        val manager = context.getSystemService(NotificationManager::class.java)
        manager.createNotificationChannel(NotificationChannel("nexus_reminders", "Nexus reminders", NotificationManager.IMPORTANCE_HIGH))
        manager.notify(title.hashCode(), NotificationCompat.Builder(context, "nexus_reminders")
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle("Nexus reminder")
            .setContentText(title)
            .setAutoCancel(true)
            .build())
    }
}
