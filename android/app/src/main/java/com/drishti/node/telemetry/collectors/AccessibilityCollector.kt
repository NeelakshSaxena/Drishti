package com.drishti.node.telemetry.collectors

import com.drishti.node.telemetry.NotificationEventBus
import com.drishti.node.telemetry.TelemetryCollector
import com.drishti.node.telemetry.models.TelemetryEvent
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.filter

class AccessibilityCollector : TelemetryCollector {
    override val name = "accessibility"
    // Disabled by default per requirements
    override var isEnabled = false

    override fun setEnabled(enabled: Boolean) { isEnabled = enabled }

    override fun startCollecting(): Flow<TelemetryEvent> {
        return NotificationEventBus.events.filter { 
            (it.type == "foreground_app" || it.type == "ui_text_extracted") && isEnabled 
        }
    }
    
    override fun stopCollecting() {}
}
