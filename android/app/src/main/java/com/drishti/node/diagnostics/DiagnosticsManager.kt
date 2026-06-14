package com.drishti.node.diagnostics

import android.content.Context

object DiagnosticsManager {
    var websocketReconnects = 0
    var messagesSent = 0
    var batteryLevel = -1
    
    fun recordReconnect() {
        websocketReconnects++
        DiagnosticsLogger.log("DiagnosticsManager", "WebSocket Reconnected. Total: $websocketReconnects")
    }
    
    fun recordTelemetrySent() {
        messagesSent++
    }
    
    fun updateBatteryLevel(level: Int) {
        batteryLevel = level
        DiagnosticsLogger.log("DiagnosticsManager", "Battery Level Updated: $level%")
    }
    
    fun generateHealthReport(context: Context): String {
        return """
            Health Report
            -------------
            WebSocket Reconnects: $websocketReconnects
            Telemetry Messages Sent: $messagesSent
            Last Battery Level: ${if(batteryLevel != -1) "$batteryLevel%" else "Unknown"}
            Total Logs Captured: ${DiagnosticsLogger.exportLogs(context).readLines().size}
        """.trimIndent()
    }
}
