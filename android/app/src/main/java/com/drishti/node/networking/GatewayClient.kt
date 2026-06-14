package com.drishti.node.networking

import android.util.Log
import com.drishti.node.diagnostics.DiagnosticsLogger
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import okhttp3.*
import java.util.concurrent.TimeUnit

class GatewayClient {

    private val client = OkHttpClient.Builder()
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(10, TimeUnit.SECONDS)
        .build()

    private var webSocket: WebSocket? = null
    
    private val _connectionState = MutableStateFlow(false)
    val connectionState: StateFlow<Boolean> = _connectionState

    private val _pingMs = MutableStateFlow(0L)
    val pingMs: StateFlow<Long> = _pingMs

    fun connect() {
        val request = Request.Builder()
            // In a real app, this would be read from config
            .url("ws://localhost:8080/ws")
            .build()
            
        webSocket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                DiagnosticsLogger.log("GatewayClient", "Connected to Gateway")
                _connectionState.value = true
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                // Parse commands, sync responses, etc.
                if (text == "PONG") {
                    // Update ping based on response time tracking in real life
                    _pingMs.value = (20L..80L).random()
                }
            }

            override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                DiagnosticsLogger.log("GatewayClient", "Disconnected: $reason")
                _connectionState.value = false
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                DiagnosticsLogger.log("GatewayClient", "Connection Failure: ${t.message}")
                _connectionState.value = false
            }
        })
    }

    fun sendHeartbeat() {
        if (_connectionState.value) {
            webSocket?.send("PING")
        }
    }

    fun sendSync() {
        if (_connectionState.value) {
            webSocket?.send("SYNC_REQUEST")
            DiagnosticsLogger.log("GatewayClient", "Sync Request Sent")
        }
    }

    fun disconnect() {
        webSocket?.close(1000, "User requested disconnect")
        _connectionState.value = false
    }
}
