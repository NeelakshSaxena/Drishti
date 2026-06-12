package com.drishti.node.core

object Constants {
    const val WEBSOCKET_URL = "wss://backend.drishti.local/ws" // Enforce WSS
    const val HTTP_URL = "https://backend.drishti.local/api" // Enforce HTTPS
    const val NOTIFICATION_CHANNEL_ID = "drishti_node_channel"
    const val HEARTBEAT_INTERVAL_MS = 30000L
    const val CERT_PIN = "sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=" // Placeholder pin
}
