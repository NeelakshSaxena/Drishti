package com.drishti.node.telemetry.models

data class TelemetryEvent(
    val type: String,
    val timestamp: Long,
    val data: Map<String, Any>
)

data class TelemetryBatch(
    val events: List<TelemetryEvent>
)
