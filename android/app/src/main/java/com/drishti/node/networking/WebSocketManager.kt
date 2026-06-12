package com.drishti.node.networking

import com.drishti.node.core.Constants
import com.drishti.node.storage.LogStorage
import kotlinx.coroutines.*
import okhttp3.*
import java.util.concurrent.TimeUnit

class WebSocketManager(
    private val authTokenManager: AuthTokenManager,
    private val logStorage: LogStorage
) {
    private val client = OkHttpClient.Builder()
        .readTimeout(0, TimeUnit.MILLISECONDS)
        .build()

    private var webSocket: WebSocket? = null
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private var isConnected = false
    private var reconnectAttempt = 0

    fun connect() {
        if (isConnected) return
        val token = authTokenManager.getToken()
        val request = Request.Builder()
            .url("${Constants.WEBSOCKET_URL}?token=$token")
            .build()

        webSocket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                isConnected = true
                reconnectAttempt = 0
                logStorage.log("WebSocket connected")
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                logStorage.log("Message received: $text")
            }

            override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                isConnected = false
                logStorage.log("WebSocket closed: $reason")
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                isConnected = false
                logStorage.log("WebSocket failure: ${t.message}")
                scheduleReconnect()
            }
        })
    }

    fun send(message: String) {
        if (isConnected) {
            webSocket?.send(message)
        } else {
            logStorage.log("Cannot send, disconnected")
        }
    }

    fun disconnect() {
        webSocket?.close(1000, "Service stopping")
        isConnected = false
    }

    private fun scheduleReconnect() {
        scope.launch {
            val delayMs = (1000L * (1 shl reconnectAttempt)).coerceAtMost(60000L)
            logStorage.log("Reconnecting in $delayMs ms")
            delay(delayMs)
            reconnectAttempt++
            connect()
        }
    }
}
