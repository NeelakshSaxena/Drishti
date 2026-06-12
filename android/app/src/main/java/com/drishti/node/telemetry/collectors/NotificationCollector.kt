package com.drishti.node.telemetry.collectors

import com.drishti.node.telemetry.NotificationEventBus
import com.drishti.node.telemetry.TelemetryCollector
import com.drishti.node.telemetry.models.TelemetryEvent
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.filter

class NotificationCollector : TelemetryCollector {
    override val name = "notification"
    override var isEnabled = true

    override fun startCollecting(): Flow<TelemetryEvent> {
        return NotificationEventBus.events.filter { it.type == "notification" }
    }
    
    override fun stopCollecting() {}
}
