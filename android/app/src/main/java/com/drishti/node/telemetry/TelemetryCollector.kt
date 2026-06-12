package com.drishti.node.telemetry

import com.drishti.node.telemetry.models.TelemetryEvent
import kotlinx.coroutines.flow.Flow

interface TelemetryCollector {
    val name: String
    val isEnabled: Boolean
    fun setEnabled(enabled: Boolean)
    fun startCollecting(): Flow<TelemetryEvent>
    fun stopCollecting()
}
