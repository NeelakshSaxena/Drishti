package com.drishti.node.ui

import com.drishti.node.networking.ConnectionSnapshot

data class PermissionStatus(
    val key: String,
    val title: String,
    val description: String,
    val granted: Boolean,
    val settingsOnly: Boolean = false
)

data class TelemetryStatus(
    val name: String,
    val detail: String,
    val active: Boolean
)

data class NodeUiState(
    val loading: Boolean = true,
    val authenticated: Boolean = false,
    val deviceId: String? = null,
    val deviceName: String = "Android Node",
    val backendUrl: String = "",
    val alwaysRemember: Boolean = true,
    val darkMode: Boolean = true,
    val serviceRunning: Boolean = false,
    val connection: ConnectionSnapshot = ConnectionSnapshot(),
    val batteryLevel: Int? = null,
    val permissions: List<PermissionStatus> = emptyList(),
    val telemetry: List<TelemetryStatus> = emptyList(),
    val diagnostics: String = "",
    val error: String? = null,
    val message: String? = null,
    val operationInProgress: Boolean = false
)
