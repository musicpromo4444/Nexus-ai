package ai.nexus.assistant

data class NexusSession(
    val userId: String,
    val signedIn: Boolean,
    val displayName: String = ""
)
