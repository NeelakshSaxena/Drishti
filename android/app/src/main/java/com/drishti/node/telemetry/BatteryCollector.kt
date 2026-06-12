package com.drishti.node.telemetry

import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.BatteryManager

class BatteryCollector(private val context: Context) {
    fun getBatteryLevel(): Float {
        val batteryStatus: Intent? = IntentFilter(Intent.ACTION_BATTERY_CHANGED).let { ifilter ->
            context.registerReceiver(null, ifilter)
        }
        val level: Int = batteryStatus?.getIntExtra(BatteryManager.EXTRA_LEVEL, -1) ?: -1
        val scale: Int = batteryStatus?.getIntExtra(BatteryManager.EXTRA_SCALE, -1) ?: -1

        return level * 100f / scale.toFloat()
    }
}
