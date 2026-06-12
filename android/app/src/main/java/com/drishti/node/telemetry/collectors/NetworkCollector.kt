package com.drishti.node.telemetry.collectors

import android.content.Context
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import com.drishti.node.telemetry.TelemetryCollector
import com.drishti.node.telemetry.models.TelemetryEvent
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow

class NetworkCollector(private val context: Context) : TelemetryCollector {
    override val name = "network"
    override var isEnabled = true

    override fun setEnabled(enabled: Boolean) { isEnabled = enabled }

    override fun startCollecting(): Flow<TelemetryEvent> = callbackFlow {
        val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        
        val networkCallback = object : ConnectivityManager.NetworkCallback() {
            override fun onCapabilitiesChanged(network: Network, networkCapabilities: NetworkCapabilities) {
                if (!isEnabled) return
                val isWifi = networkCapabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI)
                val isCellular = networkCapabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR)
                
                trySend(TelemetryEvent(
                    type = "network_update",
                    timestamp = System.currentTimeMillis(),
                    data = mapOf("wifi" to isWifi, "cellular" to isCellular)
                ))
            }
        }
        
        connectivityManager.registerDefaultNetworkCallback(networkCallback)
        
        awaitClose {
            connectivityManager.unregisterNetworkCallback(networkCallback)
        }
    }
    
    override fun stopCollecting() {}
}
