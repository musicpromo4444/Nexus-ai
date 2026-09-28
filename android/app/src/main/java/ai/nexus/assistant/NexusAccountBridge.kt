package ai.nexus.assistant

import android.content.Context

class NexusAccountBridge(context: Context) {
    private val store = NexusSyncStore(context)

    fun currentUserId(): String? = store.userId()

    fun prepareLocalSession(userId: String): NexusSession {
        store.saveLocalSnapshot(userId, store.memories(), store.settings())
        return NexusSession(userId, true)
    }
}
