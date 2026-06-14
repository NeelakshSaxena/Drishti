package com.drishti.node.telemetry.collectors

import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.BatteryManager
import com.drishti.node.telemetry.TelemetryCollector
import com.drishti.node.telemetry.models.TelemetryEvent
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import android.content.BroadcastReceiver

class BatteryCollector(private val context: Context) : TelemetryCollector {
    override val name = "battery"
    override var isEnabled = true

    override fun startCollecting(): Flow<TelemetryEvent> = callbackFlow {
        val receiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context?, intent: Intent?) {
                if (!isEnabled || intent == null) return
                
                val level = intent.getIntExtra(BatteryManager.EXTRA_LEVEL, -1)
                val scale = intent.getIntExtra(BatteryManager.EXTRA_SCALE, -1)
                val status = intent.getIntExtra(BatteryManager.EXTRA_STATUS, -1)
                
                val batteryPct = level * 100f / scale.toFloat()
                val isCharging = status == BatteryManager.BATTERY_STATUS_CHARGING ||
                                 status == BatteryManager.BATTERY_STATUS_FULL

                val event = TelemetryEvent(
                    type = "battery_update",
                    timestamp = System.currentTimeMillis(),
                    data = mapOf(
                        "level" to batteryPct,
                        "isCharging" to isCharging
                    )
                )
                trySend(event)
            }
        }
        val filter = IntentFilter(Intent.ACTION_BATTERY_CHANGED)
        context.registerReceiver(receiver, filter)

        awaitClose {
            context.unregisterReceiver(receiver)
        }
    }

    override fun stopCollecting() {
        // Handled by callbackFlow awaitClose
    }
}
