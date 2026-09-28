package ai.nexus.assistant

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

class NexusSyncStore(context: Context) {
    private val prefs = context.getSharedPreferences("nexus_sync", Context.MODE_PRIVATE)

    fun saveLocalSnapshot(userId: String, memories: JSONArray, settings: JSONObject) {
        prefs.edit().putString("user_id", userId).putString("memories", memories.toString()).putString("settings", settings.toString()).apply()
    }

    fun userId(): String? = prefs.getString("user_id", null)
    fun memories(): JSONArray = JSONArray(prefs.getString("memories", "[]") ?: "[]")
    fun settings(): JSONObject = JSONObject(prefs.getString("settings", "{}") ?: "{}")
}
