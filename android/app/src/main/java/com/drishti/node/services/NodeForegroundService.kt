package com.drishti.node.services

import android.app.*
import android.content.Context
import android.content.Intent
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
    private var started = false

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

        var serviceType = android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC
        
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.Q) {
            if (androidx.core.content.ContextCompat.checkSelfPermission(this, android.Manifest.permission.ACCESS_FINE_LOCATION) == android.content.pm.PackageManager.PERMISSION_GRANTED) {
                serviceType = serviceType or android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION
            }
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.R && 
                androidx.core.content.ContextCompat.checkSelfPermission(this, android.Manifest.permission.RECORD_AUDIO) == android.content.pm.PackageManager.PERMISSION_GRANTED) {
                serviceType = serviceType or android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE
            }
            if (android.os.Build.VERSION.SDK_INT < android.os.Build.VERSION_CODES.S || 
                androidx.core.content.ContextCompat.checkSelfPermission(this, "android.permission.BLUETOOTH_CONNECT") == android.content.pm.PackageManager.PERMISSION_GRANTED) {
                serviceType = serviceType or android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_CONNECTED_DEVICE
            }
        }

        try {
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.Q) {
                androidx.core.app.ServiceCompat.startForeground(this, 1, notification, serviceType)
            } else {
                startForeground(1, notification)
            }
        } catch (e: Exception) {
            e.printStackTrace()
            startForeground(1, notification)
        }
        
        if (!started) {
            started = true
            webSocketManager.connect()
            telemetryManager.start()
            // Only start listening if microphone permission is actually granted
            if (androidx.core.content.ContextCompat.checkSelfPermission(this, android.Manifest.permission.RECORD_AUDIO) == android.content.pm.PackageManager.PERMISSION_GRANTED) {
                audioCollector.startListening()
            }
            startHeartbeat()
        }

        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        super.onDestroy()
        telemetryManager.stop()
        audioCollector.stopListening()
        webSocketManager.disconnect()
        scope.cancel()
        started = false
    }

    override fun onTaskRemoved(rootIntent: Intent?) {
        super.onTaskRemoved(rootIntent)
        val restartIntent = Intent(applicationContext, this.javaClass)
        restartIntent.setPackage(packageName)
        val restartPendingIntent = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            PendingIntent.getForegroundService(
                applicationContext, 1, restartIntent, PendingIntent.FLAG_ONE_SHOT or PendingIntent.FLAG_IMMUTABLE
            )
        } else {
            PendingIntent.getService(
                applicationContext, 1, restartIntent, PendingIntent.FLAG_ONE_SHOT or PendingIntent.FLAG_IMMUTABLE
            )
        }
        val alarmManager = getSystemService(Context.ALARM_SERVICE) as AlarmManager
        alarmManager.set(
            AlarmManager.ELAPSED_REALTIME,
            android.os.SystemClock.elapsedRealtime() + 1000,
            restartPendingIntent
        )
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
        val channel = NotificationChannel(
            Constants.NOTIFICATION_CHANNEL_ID,
            "Drishti Node Service",
            NotificationManager.IMPORTANCE_LOW
        )
        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.createNotificationChannel(channel)
    }
}
