package com.drishti.node.services

import android.app.*
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.drishti.node.core.Constants
import com.drishti.node.networking.WebSocketManager
import com.drishti.node.telemetry.TelemetryManager
import com.drishti.node.audio.AudioCollector
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.*
import javax.inject.Inject

@AndroidEntryPoint
class NodeForegroundService : Service() {

    @Inject lateinit var webSocketManager: WebSocketManager
    @Inject lateinit var telemetryManager: TelemetryManager
    @Inject lateinit var audioCollector: AudioCollector
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val notification = NotificationCompat.Builder(this, Constants.NOTIFICATION_CHANNEL_ID)
            .setContentTitle("Drishti Node Running")
            .setContentText("Collecting telemetry and awaiting wake word")
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .build()

        startForeground(1, notification)
        
        webSocketManager.connect()
        telemetryManager.start()
        audioCollector.startListening()
        startHeartbeat()

        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        super.onDestroy()
        telemetryManager.stop()
        audioCollector.stopListening()
        webSocketManager.disconnect()
        scope.cancel()
    }

    private fun startHeartbeat() {
        scope.launch {
            while(isActive) {
                webSocketManager.send("{\"type\": \"heartbeat\"}")
                delay(Constants.HEARTBEAT_INTERVAL_MS)
            }
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                Constants.NOTIFICATION_CHANNEL_ID,
                "Drishti Node Service",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }
}
