package ai.nexus.assistant

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent

class NexusScheduler(private val context: Context) {
    fun scheduleIn(id: String, title: String, delayMillis: Long): Boolean = schedule(id, title, System.currentTimeMillis() + delayMillis)

    fun schedule(id: String, title: String, triggerAtMillis: Long): Boolean {
        val alarm = context.getSystemService(AlarmManager::class.java)
        val intent = Intent(context, NexusAlarmReceiver::class.java).putExtra("title", title)
        val pending = PendingIntent.getBroadcast(context, id.hashCode(), intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        return try {
            alarm.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMillis, pending)
            true
        } catch (_: SecurityException) { false }
    }

    fun cancel(id: String) {
        val alarm = context.getSystemService(AlarmManager::class.java)
        val pending = PendingIntent.getBroadcast(context, id.hashCode(), Intent(context, NexusAlarmReceiver::class.java), PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        alarm.cancel(pending)
    }
}
