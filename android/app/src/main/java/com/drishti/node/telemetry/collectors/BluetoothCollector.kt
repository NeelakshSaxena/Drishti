package com.drishti.node.telemetry.collectors

import android.content.Context
import com.drishti.node.telemetry.TelemetryCollector
import com.drishti.node.telemetry.models.TelemetryEvent
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow

class BluetoothCollector(private val context: Context) : TelemetryCollector {
    override val name = "bluetooth"
    override var isEnabled = true

    override fun setEnabled(enabled: Boolean) { isEnabled = enabled }

    override fun startCollecting(): Flow<TelemetryEvent> = flow {
        while(true) {
            if (isEnabled) {
                emit(TelemetryEvent(
                    type = "bluetooth_update",
                    timestamp = System.currentTimeMillis(),
                    data = mapOf("connectedDevices" to 0) // Mock value
                ))
            }
            delay(60000)
        }
    }
    
    override fun stopCollecting() {}
}
