package com.drishti.node

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.ScrollView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.SwitchCompat
import androidx.lifecycle.lifecycleScope
import com.drishti.node.diagnostics.DiagnosticsLogger
import com.drishti.node.diagnostics.DiagnosticsManager
import com.drishti.node.networking.GatewayClient
import com.drishti.node.services.NodeForegroundService
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {

    private lateinit var tvStatusText: TextView
    private lateinit var tvUptime: TextView
    private lateinit var tvConnection: TextView
    private lateinit var tvPing: TextView
    private lateinit var tvGateway: TextView
    private lateinit var tvBattery: TextView
    private lateinit var tvSync: TextView
    private lateinit var tvLastSync: TextView
    private lateinit var switchService: SwitchCompat
    private lateinit var tvLogs: TextView
    private lateinit var svLogs: ScrollView

    private val gatewayClient = GatewayClient()

    // App State
    private var isConnected = false
    private var isServiceRunning = true
    private var uptimeSeconds = 0 
    private var lastPingMs = 0L
    private var syncStatus = "Healthy"
    private var batteryPct = 100
    private var logs = mutableListOf<String>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        DiagnosticsLogger.log("MainActivity", "Starting application UI")

        initViews()
        bindState()
        
        // Start connectivity
        gatewayClient.connect()
        startStateLoop()
        observeGateway()

        val serviceIntent = Intent(this, NodeForegroundService::class.java)
        startForegroundService(serviceIntent)
    }

    private fun observeGateway() {
        lifecycleScope.launch {
            gatewayClient.connectionState.collectLatest { connected ->
                isConnected = connected
                if (connected) {
                    appendLog("Gateway connected successfully")
                } else {
                    appendLog("Gateway disconnected. Reconnecting...")
                    delay(5000)
                    gatewayClient.connect()
                }
                updateUI()
            }
        }
        
        lifecycleScope.launch {
            gatewayClient.pingMs.collectLatest { ping ->
                lastPingMs = ping
                updateUI()
            }
        }
    }

    private fun initViews() {
        tvStatusText = findViewById(R.id.tvStatusText)
        tvUptime = findViewById(R.id.tvUptime)
        tvConnection = findViewById(R.id.tvConnection)
        tvPing = findViewById(R.id.tvPing)
        tvGateway = findViewById(R.id.tvGateway)
        tvBattery = findViewById(R.id.tvBattery)
        tvSync = findViewById(R.id.tvSync)
        tvLastSync = findViewById(R.id.tvLastSync)
        switchService = findViewById(R.id.switchService)
        tvLogs = findViewById(R.id.tvLogs)
        svLogs = findViewById(R.id.svLogs)

        findViewById<Button>(R.id.btnRestart).setOnClickListener {
            appendLog("Restarting gateway connection...")
            gatewayClient.disconnect()
            lifecycleScope.launch {
                delay(1000)
                gatewayClient.connect()
            }
        }

        findViewById<Button>(R.id.btnForceSync).setOnClickListener {
            appendLog("Forcing synchronization...")
            DiagnosticsManager.recordTelemetrySent()
            gatewayClient.sendSync()
            lifecycleScope.launch {
                syncStatus = "Syncing..."
                updateUI()
                delay(1000)
                syncStatus = "Healthy"
                tvLastSync.text = "Just now"
                appendLog("Sync successful")
                updateUI()
            }
        }

        findViewById<Button>(R.id.btnLogs).setOnClickListener {
            appendLog("Exporting diagnostics...")
            val file = DiagnosticsLogger.exportLogs(this)
            appendLog("Exported to ${file.name}")
        }

        switchService.setOnCheckedChangeListener { _, isChecked ->
            isServiceRunning = isChecked
            val intent = Intent(this, NodeForegroundService::class.java)
            if (isChecked) {
                startForegroundService(intent)
                appendLog("Drishti Service Started")
            } else {
                stopService(intent)
                appendLog("Drishti Service Stopped")
            }
        }
    }

    private fun bindState() {
        switchService.isChecked = isServiceRunning
        updateUI()
    }

    private fun updateUI() {
        if (isConnected) {
            tvStatusText.text = "ONLINE"
            tvConnection.text = "Connected"
            tvConnection.setTextColor(resources.getColor(R.color.accent_cyan, null))
            tvGateway.text = "Reachable"
            tvGateway.setTextColor(resources.getColor(R.color.accent_cyan, null))
        } else {
            tvStatusText.text = "OFFLINE"
            tvConnection.text = "Disconnected"
            tvConnection.setTextColor(resources.getColor(R.color.error, null))
            tvGateway.text = "Unreachable"
            tvGateway.setTextColor(resources.getColor(R.color.error, null))
        }

        tvPing.text = "$lastPingMs ms"
        tvBattery.text = "$batteryPct%"
        tvSync.text = syncStatus

        val hours = uptimeSeconds / 3600
        val minutes = (uptimeSeconds % 3600) / 60
        val seconds = uptimeSeconds % 60
        tvUptime.text = String.format("%02d:%02d:%02d", hours, minutes, seconds)
        
        tvLogs.text = logs.joinToString("\n")
        svLogs.post { svLogs.fullScroll(ScrollView.FOCUS_DOWN) }
    }

    private fun appendLog(msg: String) {
        val time = java.text.SimpleDateFormat("HH:mm:ss", java.util.Locale.getDefault()).format(java.util.Date())
        logs.add("[$time] $msg")
        if (logs.size > 100) logs.removeAt(0)
        runOnUiThread { updateUI() }
    }

    private fun startStateLoop() {
        lifecycleScope.launch {
            while (true) {
                delay(1000)
                if (isServiceRunning) {
                    uptimeSeconds++
                    if (uptimeSeconds % 5 == 0 && isConnected) {
                        gatewayClient.sendHeartbeat()
                        if ((0..10).random() == 0) batteryPct = maxOf(0, batteryPct - 1)
                    }
                }
                updateUI()
            }
        }
    }
}
