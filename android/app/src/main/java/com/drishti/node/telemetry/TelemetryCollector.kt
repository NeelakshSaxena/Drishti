package com.drishti.node.telemetry

import com.drishti.node.telemetry.models.TelemetryEvent
import kotlinx.coroutines.flow.Flow

interface TelemetryCollector {
    val name: String
    var isEnabled: Boolean
    fun startCollecting(): Flow<TelemetryEvent>
    fun stopCollecting()
}
