package com.drishti.node.audio

import android.annotation.SuppressLint
import android.content.Context
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import android.util.Base64
import com.drishti.node.networking.WebSocketManager
import com.drishti.node.permissions.PermissionHelper
import kotlinx.coroutines.*
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AudioCollector @Inject constructor(
    private val context: Context,
    private val permissionHelper: PermissionHelper,
    private val webSocketManager: WebSocketManager,
    private val wakeWordEngine: WakeWordEngine,
    private val vadEngine: VadEngine
) {
    private val SAMPLE_RATE = 16000 // Whisper compatible
    private val CHANNEL_CONFIG = AudioFormat.CHANNEL_IN_MONO
    private val AUDIO_FORMAT = AudioFormat.ENCODING_PCM_16BIT
    private val BUFFER_SIZE = AudioRecord.getMinBufferSize(SAMPLE_RATE, CHANNEL_CONFIG, AUDIO_FORMAT) * 2

    private var audioRecord: AudioRecord? = null
    private var isRecording = false
    private var isStreaming = false
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private var recordJob: Job? = null

    @SuppressLint("MissingPermission")
    fun startListening() {
        if (!permissionHelper.hasPermission("android.permission.RECORD_AUDIO")) return
        if (isRecording) return

        try {
            audioRecord = AudioRecord(
                MediaRecorder.AudioSource.MIC,
                SAMPLE_RATE,
                CHANNEL_CONFIG,
                AUDIO_FORMAT,
                BUFFER_SIZE
            )

            audioRecord?.startRecording()
            isRecording = true
            
            recordJob = scope.launch {
                val buffer = ShortArray(BUFFER_SIZE / 2)
                
                while (isActive && isRecording) {
                    val readResult = audioRecord?.read(buffer, 0, buffer.size) ?: 0
                    if (readResult > 0) {
                        processAudio(buffer, readResult)
                    }
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
            stopListening()
        }
    }

    private fun processAudio(buffer: ShortArray, readSize: Int) {
        if (!isStreaming) {
            // Idle state: Check for wake word
            val wakeWordDetected = wakeWordEngine.process(buffer, readSize)
            if (wakeWordDetected) {
                isStreaming = true
                vadEngine.reset()
                sendAudioEvent("wake_word_detected", null)
                streamChunk(buffer, readSize)
            }
        } else {
            // Streaming state: Send chunks until VAD detects silence
            val voiceActive = vadEngine.process(buffer, readSize)
            if (voiceActive) {
                streamChunk(buffer, readSize)
            } else {
                isStreaming = false
                sendAudioEvent("stream_end", null)
            }
        }
    }

    private fun streamChunk(buffer: ShortArray, readSize: Int) {
        // Convert ShortArray to ByteArray (PCM 16-bit)
        val byteArray = ByteArray(readSize * 2)
        for (i in 0 until readSize) {
            byteArray[i * 2] = (buffer[i].toInt() and 0x00FF).toByte()
            byteArray[i * 2 + 1] = (buffer[i].toInt() shr 8).toByte()
        }
        
        val base64Audio = Base64.encodeToString(byteArray, Base64.NO_WRAP)
        sendAudioEvent("audio_chunk", base64Audio)
    }

    private fun sendAudioEvent(type: String, base64Payload: String?) {
        val payloadStr = if (base64Payload != null) ", \"payload\": \"$base64Payload\"" else ""
        val json = "{\"type\": \"audio_event\", \"event\": \"$type\", \"timestamp\": ${System.currentTimeMillis()}$payloadStr}"
        webSocketManager.send(json)
    }

    fun stopListening() {
        isRecording = false
        isStreaming = false
        recordJob?.cancel()
        audioRecord?.stop()
        audioRecord?.release()
        audioRecord = null
    }
}
