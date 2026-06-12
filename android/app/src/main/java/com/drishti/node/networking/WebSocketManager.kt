package com.drishti.node.networking

import com.drishti.node.core.Constants
import com.drishti.node.storage.LogStorage
import kotlinx.coroutines.*
import okhttp3.*
import org.json.JSONObject
import java.util.concurrent.TimeUnit

class WebSocketManager(
    private val authTokenManager: AuthTokenManager,
    private val logStorage: LogStorage
) {
    // Optional Certificate Pinning
    private val certificatePinner = CertificatePinner.Builder()
        .add("backend.drishti.local", Constants.CERT_PIN)
        .build()

    private val client = OkHttpClient.Builder()
        .readTimeout(0, TimeUnit.MILLISECONDS)
        .certificatePinner(certificatePinner) // Enforce Pinning
        .build()

    private var webSocket: WebSocket? = null
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private var isConnected = false
    private var reconnectAttempt = 0

    fun connect() {
        if (isConnected) return
        
        // Token Rotation Check
        if (!authTokenManager.isTokenValid()) {
            rotateToken() // Synchronously or trigger rotation flow
        }
        
        val token = authTokenManager.getToken() ?: return
        val request = Request.Builder()
            .url("${Constants.WEBSOCKET_URL}?token=$token") // Uses WSS
            .build()

        webSocket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                isConnected = true
                reconnectAttempt = 0
                logStorage.log("Secure WebSocket connected") // Secrets NOT logged
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                // Ignore empty/spam for logs
            }

            override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                isConnected = false
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                isConnected = false
                scheduleReconnect()
            }
        })
    }

    fun send(rawPayload: String) {
        if (isConnected) {
            val secret = authTokenManager.getSecret() ?: return
            
            // Replay Protection & Signing
            val timestamp = System.currentTimeMillis()
            val nonce = CryptoUtils.generateNonce()
            
            val json = JSONObject(rawPayload)
            json.put("timestamp", timestamp)
            json.put("nonce", nonce)
            
            val stringToSign = json.toString()
            val signature = CryptoUtils.signPayload(stringToSign, secret)
            
            val securePayload = JSONObject()
            securePayload.put("payload", json)
            securePayload.put("signature", signature)

            webSocket?.send(securePayload.toString())
        }
    }

    fun disconnect() {
        webSocket?.close(1000, "Service stopping")
        isConnected = false
    }

    private fun scheduleReconnect() {
        scope.launch {
            val delayMs = (1000L * (1 shl reconnectAttempt)).coerceAtMost(60000L)
            delay(delayMs)
            reconnectAttempt++
            connect()
        }
    }
    
    private fun rotateToken() {
        // MOCK: Calls HTTPS endpoint to swap old token for new token using refresh token
        authTokenManager.saveToken("new_rotated_token", "new_secret", System.currentTimeMillis() + 86400000L)
        logStorage.log("Token Rotated successfully")
    }
}
