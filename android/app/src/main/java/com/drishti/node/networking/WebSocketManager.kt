package com.drishti.node.networking

import com.drishti.node.diagnostics.DiagnosticsManager
import com.drishti.node.storage.LogStorage
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import org.json.JSONObject
import java.util.concurrent.TimeUnit

enum class SocketStatus { DISCONNECTED, CONNECTING, CONNECTED, RECONNECTING, ERROR }

data class ConnectionSnapshot(
    val status: SocketStatus = SocketStatus.DISCONNECTED,
    val lastHeartbeatSentAt: Long? = null,
    val lastHeartbeatAckAt: Long? = null,
    val lastMessageAt: Long? = null,
    val reconnectAttempt: Int = 0,
    val error: String? = null
)

class WebSocketManager(
    private val authTokenManager: AuthTokenManager,
    private val logStorage: LogStorage
) {
    private val client = OkHttpClient.Builder()
        .readTimeout(0, TimeUnit.MILLISECONDS)
        .pingInterval(30, TimeUnit.SECONDS)
        .build()
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private var webSocket: WebSocket? = null
    private var manuallyDisconnected = false
    private val _connection = MutableStateFlow(ConnectionSnapshot())
    val connection: StateFlow<ConnectionSnapshot> = _connection.asStateFlow()

    fun connect() {
        if (_connection.value.status == SocketStatus.CONNECTED ||
            _connection.value.status == SocketStatus.CONNECTING
        ) return
        val token = authTokenManager.getToken()
        if (token.isNullOrBlank()) {
            _connection.value = ConnectionSnapshot(
                status = SocketStatus.ERROR,
                error = "A device token is required"
            )
            return
        }
        manuallyDisconnected = false
        val currentAttempt = _connection.value.reconnectAttempt
        _connection.value = _connection.value.copy(
            status = if (currentAttempt == 0) SocketStatus.CONNECTING else SocketStatus.RECONNECTING,
            error = null
        )
        val request = Request.Builder().url(webSocketUrl(token)).build()
        webSocket = client.newWebSocket(request, listener)
    }

    fun send(rawPayload: String): Boolean {
        if (_connection.value.status != SocketStatus.CONNECTED) return false
        val sent = webSocket?.send(rawPayload) == true
        if (sent) {
            val type = runCatching { JSONObject(rawPayload).optString("type") }.getOrNull()
            if (type == "heartbeat" || type == "worker_heartbeat") {
                _connection.value = _connection.value.copy(lastHeartbeatSentAt = System.currentTimeMillis())
            }
            DiagnosticsManager.recordTelemetrySent()
        }
        return sent
    }

    fun sendHeartbeat(): Boolean = send("""{"type":"heartbeat"}""")

    fun disconnect() {
        manuallyDisconnected = true
        webSocket?.close(1000, "User signed out")
        webSocket = null
        _connection.value = ConnectionSnapshot()
    }

    fun reconnect() {
        webSocket?.cancel()
        _connection.value = _connection.value.copy(
            status = SocketStatus.RECONNECTING,
            reconnectAttempt = 0,
            error = null
        )
        connect()
    }

    private val listener = object : WebSocketListener() {
        override fun onOpen(webSocket: WebSocket, response: Response) {
            logStorage.log("Secure WebSocket connected")
            _connection.value = ConnectionSnapshot(status = SocketStatus.CONNECTED)
        }

        override fun onMessage(webSocket: WebSocket, text: String) {
            val now = System.currentTimeMillis()
            val type = runCatching { JSONObject(text).optString("type") }.getOrNull()
            _connection.value = _connection.value.copy(
                lastMessageAt = now,
                lastHeartbeatAckAt = if (type == "ack") now else _connection.value.lastHeartbeatAckAt,
                error = null
            )
        }

        override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
            this@WebSocketManager.webSocket = null
            _connection.value = _connection.value.copy(status = SocketStatus.DISCONNECTED)
            if (!manuallyDisconnected) scheduleReconnect("Connection closed: $reason")
        }

        override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
            this@WebSocketManager.webSocket = null
            scheduleReconnect(t.message ?: "WebSocket connection failed")
        }
    }

    private fun scheduleReconnect(message: String) {
        if (manuallyDisconnected) return
        val attempt = (_connection.value.reconnectAttempt + 1).coerceAtMost(30)
        _connection.value = _connection.value.copy(
            status = SocketStatus.RECONNECTING,
            reconnectAttempt = attempt,
            error = message
        )
        DiagnosticsManager.recordReconnect()
        scope.launch {
            delay((1_000L shl (attempt - 1).coerceAtMost(5)).coerceAtMost(30_000L))
            connect()
        }
    }

    private fun webSocketUrl(token: String): String {
        val base = authTokenManager.getBackendUrl().trimEnd('/')
            .replaceFirst("https://", "wss://")
            .replaceFirst("http://", "ws://")
        return "$base/ws/device?token=$token"
    }
}
