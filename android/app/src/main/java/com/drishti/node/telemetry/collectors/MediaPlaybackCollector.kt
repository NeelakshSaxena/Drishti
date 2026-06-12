package com.drishti.node.telemetry.collectors

import android.content.Context
import android.media.AudioManager
import com.drishti.node.telemetry.TelemetryCollector
import com.drishti.node.telemetry.models.TelemetryEvent
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow

class MediaPlaybackCollector(private val context: Context) : TelemetryCollector {
    override val name = "media"
    override var isEnabled = true

    override fun setEnabled(enabled: Boolean) { isEnabled = enabled }

    override fun startCollecting(): Flow<TelemetryEvent> = flow {
        val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
        while(true) {
            if (isEnabled) {
                emit(TelemetryEvent(
                    type = "media_update",
                    timestamp = System.currentTimeMillis(),
                    data = mapOf("isMusicActive" to audioManager.isMusicActive)
                ))
            }
            delay(30000)
        }
    }
    
    override fun stopCollecting() {}
}
