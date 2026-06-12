package com.drishti.node.telemetry.collectors

import com.drishti.node.telemetry.NotificationEventBus
import com.drishti.node.telemetry.TelemetryCollector
import com.drishti.node.telemetry.models.TelemetryEvent
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.filter

class MediaPlaybackCollector : TelemetryCollector {
    override val name = "media"
    override var isEnabled = true

    override fun setEnabled(enabled: Boolean) { isEnabled = enabled }

    override fun startCollecting(): Flow<TelemetryEvent> {
        return NotificationEventBus.events.filter { it.type == "media_session" }
    }
    
    override fun stopCollecting() {}
}
