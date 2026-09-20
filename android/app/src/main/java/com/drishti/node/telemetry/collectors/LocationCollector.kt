package com.drishti.node.telemetry.collectors

import android.annotation.SuppressLint
import android.content.Context
import android.os.Looper
import com.drishti.node.permissions.PermissionHelper
import com.drishti.node.telemetry.TelemetryCollector
import com.drishti.node.telemetry.models.TelemetryEvent
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow

class LocationCollector(
    private val context: Context,
    private val permissionHelper: PermissionHelper
) : TelemetryCollector {
    override val name = "location"
    override var isEnabled = true

    private val fusedLocationClient: FusedLocationProviderClient = LocationServices.getFusedLocationProviderClient(context)

    @SuppressLint("MissingPermission")
    override fun startCollecting(): Flow<TelemetryEvent> = callbackFlow {
        if (!isEnabled || !permissionHelper.hasPermission("android.permission.ACCESS_FINE_LOCATION") && !permissionHelper.hasPermission("android.permission.ACCESS_COARSE_LOCATION")) {
            close()
            return@callbackFlow
        }

        val locationRequest = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 10000).setMinUpdateDistanceMeters(0f)
            .setMinUpdateIntervalMillis(5000)
            .build()

        val locationCallback = object : LocationCallback() {
            override fun onLocationResult(locationResult: LocationResult) {
                locationResult.lastLocation?.let { location ->
                    android.util.Log.d("LocationCollector", "Sending location: ${location.latitude}, ${location.longitude}")
                    trySend(TelemetryEvent(
                        type = "location",
                        timestamp = System.currentTimeMillis(),
                        data = mapOf("lat" to location.latitude, "lon" to location.longitude)
                    ))
                }
            }
        }

        fusedLocationClient.requestLocationUpdates(
            locationRequest,
            locationCallback,
            Looper.getMainLooper()
        )

        awaitClose {
            fusedLocationClient.removeLocationUpdates(locationCallback)
        }
    }
    
    override fun stopCollecting() {}
}
