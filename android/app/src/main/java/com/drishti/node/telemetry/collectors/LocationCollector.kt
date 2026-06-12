package com.drishti.node.telemetry.collectors

import android.content.Context
import com.drishti.node.permissions.PermissionHelper
import com.drishti.node.telemetry.TelemetryCollector
import com.drishti.node.telemetry.models.TelemetryEvent
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow

class LocationCollector(
    private val context: Context,
    private val permissionHelper: PermissionHelper
) : TelemetryCollector {
    override val name = "location"
    override var isEnabled = true

    override fun setEnabled(enabled: Boolean) { isEnabled = enabled }

    override fun startCollecting(): Flow<TelemetryEvent> = flow {
        while(true) {
            if (isEnabled && permissionHelper.hasPermission("android.permission.ACCESS_COARSE_LOCATION")) {
                // Mock Location implementation
                emit(TelemetryEvent(
                    type = "location_update",
                    timestamp = System.currentTimeMillis(),
                    data = mapOf("lat" to 0.0, "lng" to 0.0) // Mock values
                ))
            }
            delay(300000) // Poll every 5 minutes to save battery
        }
    }
    
    override fun stopCollecting() {}
}
