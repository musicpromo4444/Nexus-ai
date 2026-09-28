package ai.nexus.assistant

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.os.IBinder
import android.os.PowerManager
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
import java.util.Locale
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import androidx.core.app.NotificationCompat

class VoiceAssistantService : Service() {
    private var recognizer: SpeechRecognizer? = null
    private var listening = false
    private var awaitingCommand = false
    private var commandTimeout: Runnable? = null
    private var tts: TextToSpeech? = null
    private val wakePhrases = listOf("hey nexus", "okay nexus", "ok nexus", "hey next us")
    private var wakeLock: PowerManager.WakeLock? = null
    private val endpoint = "https://nexus-ai-three-neon.vercel.app/api/chat"
    private val channelId = "nexus_voice"

    override fun onCreate() {
        super.onCreate()
        createChannel()
        tts = TextToSpeech(this) { status -> if (status == TextToSpeech.SUCCESS) tts?.language = Locale.getDefault() }
        startForeground(4102, notification())
        wakeLock = (getSystemService(POWER_SERVICE) as PowerManager).newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "Nexus::Voice").apply { acquire(10 * 60 * 1000L) }
        startListening()
    }

    private fun startListening() {
        if (!SpeechRecognizer.isRecognitionAvailable(this)) return
        tts?.stop()
        tts?.shutdown()
        tts = null
        recognizer?.destroy()
        recognizer = SpeechRecognizer.createSpeechRecognizer(this).also { sr ->
            sr.setRecognitionListener(object : RecognitionListener {
                override fun onReadyForSpeech(params: android.os.Bundle?) { listening = true }
                override fun onBeginningOfSpeech() {}
                override fun onRmsChanged(rmsdB: Float) {}
                override fun onBufferReceived(buffer: ByteArray?) {}
                override fun onEndOfSpeech() { listening = false; restart() }
                override fun onError(error: Int) { listening = false; restart() }
                override fun onResults(results: android.os.Bundle?) {
                    val text = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)?.firstOrNull().orEmpty()
                    if (text.isNotBlank()) handleSpeech(text)
                    listening = false
                    restart()
                }
                override fun onPartialResults(partialResults: android.os.Bundle?) {}
                override fun onEvent(eventType: Int, params: android.os.Bundle?) {}
            })
        }
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
        }
        recognizer?.startListening(intent)
    }

    private fun handleSpeech(raw: String) {
        val text = raw.trim()
        val normalized = text.lowercase().replace(Regex("[^a-z0-9\\s]"), " ").replace(Regex("\\s+"), " ").trim()
        val wake = wakePhrases.firstOrNull { normalized == it || normalized.startsWith("$it ") }
        if (wake != null) {
            val commandText = normalized.removePrefix(wake).trim()
            speakListening()
            if (commandText.isNotBlank()) {
                dispatchCommand(commandText)
            } else {
                awaitingCommand = true
                commandTimeout?.let { android.os.Handler(mainLooper).removeCallbacks(it) }
                commandTimeout = Runnable { awaitingCommand = false }
                android.os.Handler(mainLooper).postDelayed(commandTimeout!!, 8000)
            }
            return
        }
        if (awaitingCommand) {
            awaitingCommand = false
            commandTimeout?.let { android.os.Handler(mainLooper).removeCallbacks(it) }
            dispatchCommand(text)
        }
    }

    private fun speakListening() {
        tts?.speak("I’m listening.", TextToSpeech.QUEUE_FLUSH, null, "nexus_listening")
        sendBroadcast(Intent(ACTION_LISTENING).setPackage(packageName))
    }

    private fun dispatchCommand(text: String) {
        val command = JSONObject().put("type", "voice_transcript").put("text", text).put("source", "android_voice").toString()
        sendBroadcast(Intent(ACTION_COMMAND).setPackage(packageName).putExtra("command", command))
        Thread { requestAi(text) }.start()
    }

    private fun requestAi(text: String) {
        try {
            val connection = (URL(endpoint).openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                connectTimeout = 8000
                readTimeout = 15000
                doOutput = true
                setRequestProperty("Content-Type", "application/json")
            }
            connection.outputStream.use { it.write(JSONObject().put("message", text).toString().toByteArray()) }
            val body = connection.inputStream.bufferedReader().use { it.readText() }
            sendBroadcast(Intent(ACTION_AI_RESPONSE).setPackage(packageName).putExtra("response", body))
            connection.disconnect()
        } catch (e: Exception) {
            sendBroadcast(Intent(ACTION_AI_RESPONSE).setPackage(packageName).putExtra("error", "AI service unavailable"))
        }
    }

    private fun restart() {
        if (!listening) android.os.Handler(mainLooper).postDelayed({ startListening() }, 400)
    }

    private fun createChannel() {
        val manager = getSystemService(NotificationManager::class.java)
        manager.createNotificationChannel(NotificationChannel(channelId, "Nexus voice assistant", NotificationManager.IMPORTANCE_LOW))
    }

    private fun notification(): Notification =
        NotificationCompat.Builder(this, channelId)
            .setSmallIcon(android.R.drawable.ic_btn_speak_now)
            .setContentTitle("Nexus is listening")
            .setContentText("Voice assistant is active")
            .setOngoing(true)
            .build()

    override fun onDestroy() {
        commandTimeout?.let { android.os.Handler(mainLooper).removeCallbacks(it) }
        recognizer?.destroy()
        recognizer = null
        wakeLock?.let { if (it.isHeld) it.release() }
        wakeLock = null
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    companion object { const val ACTION_COMMAND = "ai.nexus.assistant.NEXUS_COMMAND"
        const val ACTION_AI_RESPONSE = "ai.nexus.assistant.NEXUS_AI_RESPONSE"
        const val ACTION_LISTENING = "ai.nexus.assistant.NEXUS_LISTENING" }
}
