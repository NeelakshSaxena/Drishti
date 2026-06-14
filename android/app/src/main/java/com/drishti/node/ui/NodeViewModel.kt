package com.drishti.node.ui

import android.Manifest
import android.app.Application
import android.content.Context
import android.content.Intent
import android.os.BatteryManager
import android.provider.Settings
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.drishti.node.diagnostics.DiagnosticsManager
import com.drishti.node.networking.AuthTokenManager
import com.drishti.node.networking.SocketStatus
import com.drishti.node.networking.WebSocketManager
import com.drishti.node.onboarding.OnboardingManager
import com.drishti.node.permissions.PermissionHelper
import com.drishti.node.services.NodeForegroundService
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class NodeViewModel @Inject constructor(
    application: Application,
    private val auth: AuthTokenManager,
    private val socket: WebSocketManager,
    private val onboarding: OnboardingManager,
    private val permissionHelper: PermissionHelper
) : AndroidViewModel(application) {
    private val context: Context get() = getApplication()
    private val _uiState = MutableStateFlow(NodeUiState())
    val uiState: StateFlow<NodeUiState> = _uiState.asStateFlow()

    init {
        refreshLocalState()
        viewModelScope.launch {
            socket.connection.collectLatest { connection ->
                _uiState.update { it.copy(connection = connection, loading = false) }
            }
        }
        viewModelScope.launch {
            while (isActive) {
                refreshRuntimeState()
                delay(5_000)
            }
        }
    }

    fun restoreSession() {
        refreshLocalState()
        if (auth.isTokenValid() && auth.isAlwaysRememberEnabled()) {
            startService()
            socket.connect()
        }
        _uiState.update { it.copy(loading = false) }
    }

    fun loginWithDeviceToken(token: String, deviceName: String, backendUrl: String, remember: Boolean) {
        if (token.isBlank() || backendUrl.isBlank()) {
            setError("Enter the backend URL and device token.")
            return
        }
        auth.saveSession(token.trim(), auth.getDeviceId(), deviceName.ifBlank { "Android Node" }, backendUrl, remember)
        refreshLocalState()
        socket.connect()
        startService()
        _uiState.update { it.copy(message = "Device session saved", error = null) }
    }

    fun pairDevice(payload: String, deviceName: String) {
        if (payload.isBlank()) {
            setError("Paste the pairing QR payload.")
            return
        }
        viewModelScope.launch {
            _uiState.update { it.copy(operationInProgress = true, error = null) }
            onboarding.processQrPayload(payload, deviceName, _uiState.value.alwaysRemember)
                .onSuccess {
                    refreshLocalState()
                    socket.connect()
                    startService()
                    _uiState.update { state ->
                        state.copy(operationInProgress = false, message = "Device paired successfully")
                    }
                }
                .onFailure { error ->
                    _uiState.update {
                        it.copy(operationInProgress = false, error = error.message ?: "Pairing failed")
                    }
                }
        }
    }

    fun reconnect() {
        _uiState.update { it.copy(error = null) }
        socket.reconnect()
    }

    fun sendHeartbeat() {
        if (!socket.sendHeartbeat()) setError("Heartbeat queued until the gateway reconnects.")
    }

    fun setServiceRunning(enabled: Boolean) {
        if (enabled) startService() else {
            context.stopService(Intent(context, NodeForegroundService::class.java))
            socket.disconnect()
            _uiState.update { it.copy(serviceRunning = false) }
        }
    }

    fun saveSettings(backendUrl: String, remember: Boolean, darkMode: Boolean) {
        auth.updateSettings(backendUrl, remember, darkMode)
        refreshLocalState()
        _uiState.update { it.copy(message = "Settings saved") }
    }

    fun logout() {
        socket.disconnect()
        context.stopService(Intent(context, NodeForegroundService::class.java))
        auth.clearToken()
        refreshLocalState()
        _uiState.update { it.copy(authenticated = false, serviceRunning = false, message = "Signed out") }
    }

    fun refreshDiagnostics() {
        _uiState.update { it.copy(diagnostics = DiagnosticsManager.generateHealthReport(context)) }
    }

    fun clearNotice() {
        _uiState.update { it.copy(error = null, message = null) }
    }

    private fun startService() {
        if (!auth.isTokenValid()) return
        context.startForegroundService(Intent(context, NodeForegroundService::class.java))
        _uiState.update { it.copy(serviceRunning = true) }
    }

    private fun refreshLocalState() {
        _uiState.update {
            it.copy(
                authenticated = auth.isTokenValid(),
                deviceId = auth.getDeviceId(),
                deviceName = auth.getDeviceName(),
                backendUrl = auth.getBackendUrl(),
                alwaysRemember = auth.isAlwaysRememberEnabled(),
                darkMode = auth.isDarkModeEnabled(),
                permissions = permissionStatuses(),
                telemetry = telemetryStatuses(),
                batteryLevel = batteryLevel(),
                loading = false
            )
        }
    }

    private fun refreshRuntimeState() {
        _uiState.update {
            it.copy(
                permissions = permissionStatuses(),
                telemetry = telemetryStatuses(),
                batteryLevel = batteryLevel()
            )
        }
    }

    private fun permissionStatuses(): List<PermissionStatus> {
        val notificationAccess = Settings.Secure.getString(
            context.contentResolver,
            "enabled_notification_listeners"
        )?.contains(context.packageName) == true
        val accessibilityAccess = Settings.Secure.getString(
            context.contentResolver,
            Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
        )?.contains(context.packageName) == true
        return listOf(
            PermissionStatus(Manifest.permission.RECORD_AUDIO, "Microphone", "Wake word and voice capture", permissionHelper.hasPermission(Manifest.permission.RECORD_AUDIO)),
            PermissionStatus(Manifest.permission.ACCESS_FINE_LOCATION, "Precise location", "Location telemetry", permissionHelper.hasPermission(Manifest.permission.ACCESS_FINE_LOCATION)),
            PermissionStatus(BLUETOOTH_CONNECT_PERMISSION, "Nearby devices", "Bluetooth telemetry", permissionHelper.hasPermission(BLUETOOTH_CONNECT_PERMISSION)),
            PermissionStatus("notification_access", "Notification access", "Notification telemetry", notificationAccess, true),
            PermissionStatus("accessibility", "Accessibility service", "Optional on-device context", accessibilityAccess, true)
        )
    }

    private fun telemetryStatuses(): List<TelemetryStatus> {
        val permissions = permissionStatuses().associateBy { it.key }
        val connected = _uiState.value.connection.status == SocketStatus.CONNECTED
        return listOf(
            TelemetryStatus("Battery", "${batteryLevel()?.let { "$it%" } ?: "Unavailable"}", true),
            TelemetryStatus("Network", if (connected) "Gateway transport active" else "Waiting for gateway", connected),
            TelemetryStatus("Screen state", "Collector available", true),
            TelemetryStatus("Location", "Requires precise location", permissions[Manifest.permission.ACCESS_FINE_LOCATION]?.granted == true),
            TelemetryStatus("Bluetooth", "Requires nearby devices", permissions[BLUETOOTH_CONNECT_PERMISSION]?.granted == true),
            TelemetryStatus("Notifications", "Requires listener access", permissions["notification_access"]?.granted == true),
            TelemetryStatus("Accessibility", "Optional context stream", permissions["accessibility"]?.granted == true)
        )
    }

    private fun batteryLevel(): Int? {
        val manager = context.getSystemService(Context.BATTERY_SERVICE) as BatteryManager
        return manager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY).takeIf { it in 0..100 }
    }

    private fun setError(message: String) {
        _uiState.update { it.copy(error = message, message = null) }
    }

    companion object {
        private const val BLUETOOTH_CONNECT_PERMISSION = "android.permission.BLUETOOTH_CONNECT"
    }
}
