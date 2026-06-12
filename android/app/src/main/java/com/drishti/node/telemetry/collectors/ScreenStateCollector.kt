package com.drishti.node.telemetry.collectors

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import com.drishti.node.telemetry.TelemetryCollector
import com.drishti.node.telemetry.models.TelemetryEvent
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow

class ScreenStateCollector(private val context: Context) : TelemetryCollector {
    override val name = "screen"
    override var isEnabled = true

    override fun setEnabled(enabled: Boolean) { isEnabled = enabled }

    override fun startCollecting(): Flow<TelemetryEvent> = callbackFlow {
        val receiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context?, intent: Intent?) {
                if (!isEnabled || intent == null) return
                val isScreenOn = intent.action == Intent.ACTION_SCREEN_ON
                
                trySend(TelemetryEvent(
                    type = "screen_update",
                    timestamp = System.currentTimeMillis(),
                    data = mapOf("isScreenOn" to isScreenOn)
                ))
            }
        }
        val filter = IntentFilter().apply {
            addAction(Intent.ACTION_SCREEN_ON)
            addAction(Intent.ACTION_SCREEN_OFF)
        }
        context.registerReceiver(receiver, filter)

        awaitClose {
            context.unregisterReceiver(receiver)
        }
    }
    
    override fun stopCollecting() {}
}
