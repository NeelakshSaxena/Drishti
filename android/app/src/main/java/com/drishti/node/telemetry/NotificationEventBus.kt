package com.drishti.node.telemetry

import com.drishti.node.telemetry.models.TelemetryEvent
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow

object NotificationEventBus {
    private val _events = MutableSharedFlow<TelemetryEvent>(extraBufferCapacity = 50)
    val events = _events.asSharedFlow()

    fun emitEvent(event: TelemetryEvent) {
        _events.tryEmit(event)
    }
}
