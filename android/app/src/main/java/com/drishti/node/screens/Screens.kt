package com.drishti.node.screens

import android.Manifest
import android.content.Intent
import android.net.Uri
import android.provider.Settings
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.ArrowBack
import androidx.compose.material.icons.outlined.BatteryChargingFull
import androidx.compose.material.icons.outlined.BugReport
import androidx.compose.material.icons.outlined.CheckCircle
import androidx.compose.material.icons.outlined.ChevronRight
import androidx.compose.material.icons.outlined.CloudOff
import androidx.compose.material.icons.outlined.CloudQueue
import androidx.compose.material.icons.outlined.DarkMode
import androidx.compose.material.icons.outlined.Devices
import androidx.compose.material.icons.outlined.Fingerprint
import androidx.compose.material.icons.outlined.HealthAndSafety
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Key
import androidx.compose.material.icons.outlined.Link
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.material.icons.outlined.Logout
import androidx.compose.material.icons.outlined.Memory
import androidx.compose.material.icons.outlined.Refresh
import androidx.compose.material.icons.outlined.Router
import androidx.compose.material.icons.outlined.Security
import androidx.compose.material.icons.outlined.Sensors
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.material.icons.outlined.Sync
import androidx.compose.material.icons.outlined.Warning
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.drishti.node.BuildConfig
import com.drishti.node.components.DottedBackground
import com.drishti.node.components.EmptyState
import com.drishti.node.components.GlassCard
import com.drishti.node.components.MetricTile
import com.drishti.node.components.NoticeBanner
import com.drishti.node.components.OutlineAction
import com.drishti.node.components.PrimaryAction
import com.drishti.node.components.SectionLabel
import com.drishti.node.components.SocketStatusPill
import com.drishti.node.components.StatusPill
import com.drishti.node.networking.AuthTokenManager
import com.drishti.node.networking.SocketStatus
import com.drishti.node.theme.Amber400
import com.drishti.node.theme.Emerald400
import com.drishti.node.theme.Red400
import com.drishti.node.ui.NodeUiState
import com.drishti.node.ui.PermissionStatus
import kotlinx.coroutines.delay
import java.text.DateFormat
import java.util.Date

@Composable
fun SplashScreen(state: NodeUiState, onReady: (Boolean) -> Unit) {
    LaunchedEffect(state.loading) {
        if (!state.loading) {
            delay(850)
            onReady(state.authenticated && state.alwaysRemember)
        }
    }
    Box(Modifier.fillMaxSize()) {
        DottedBackground()
        Column(
            Modifier.fillMaxSize().statusBarsPadding().navigationBarsPadding().padding(28.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Box(
                Modifier.size(72.dp).background(MaterialTheme.colorScheme.primary, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Outlined.Sensors, "Drishti Node logo", tint = MaterialTheme.colorScheme.onPrimary, modifier = Modifier.size(34.dp))
            }
            Spacer(Modifier.height(24.dp))
            Text("DRISHTI", style = MaterialTheme.typography.displayLarge)
            Text("NODE", color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.labelLarge)
        }
    }
}

@Composable
fun LoginScreen(
    state: NodeUiState,
    onLogin: (String, String, String, Boolean) -> Unit,
    onPair: () -> Unit,
    onDismiss: () -> Unit
) {
    var token by remember { mutableStateOf("") }
    var deviceName by remember(state.deviceName) { mutableStateOf(state.deviceName) }
    var backendUrl by remember(state.backendUrl) {
        mutableStateOf(state.backendUrl.ifBlank { AuthTokenManager.DEFAULT_BACKEND_URL })
    }
    var rememberSession by remember(state.alwaysRemember) { mutableStateOf(state.alwaysRemember) }
    CenteredAuthLayout {
        SectionLabel("Secure device access")
        Spacer(Modifier.height(8.dp))
        Text("Welcome back.", style = MaterialTheme.typography.headlineLarge, modifier = Modifier.semantics { heading() })
        Text(
            "Connect this Android node using a token issued by the Drishti device gateway.",
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            style = MaterialTheme.typography.bodyMedium
        )
        Spacer(Modifier.height(24.dp))
        NoticeArea(state, onDismiss)
        OutlinedTextField(
            value = deviceName,
            onValueChange = { deviceName = it },
            label = { Text("Device name") },
            leadingIcon = { Icon(Icons.Outlined.Devices, null) },
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(Modifier.height(12.dp))
        OutlinedTextField(
            value = backendUrl,
            onValueChange = { backendUrl = it },
            label = { Text("Backend URL") },
            leadingIcon = { Icon(Icons.Outlined.Router, null) },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Uri),
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(Modifier.height(12.dp))
        OutlinedTextField(
            value = token,
            onValueChange = { token = it },
            label = { Text("Device token") },
            leadingIcon = { Icon(Icons.Outlined.Key, null) },
            visualTransformation = PasswordVisualTransformation(),
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
        )
        SettingToggle(
            title = "Always Remember",
            detail = "Restore this encrypted node session after relaunch.",
            checked = rememberSession,
            onCheckedChange = { rememberSession = it }
        )
        PrimaryAction(
            "Connect node",
            onClick = { onLogin(token, deviceName, backendUrl, rememberSession) },
            modifier = Modifier.fillMaxWidth(),
            icon = Icons.Outlined.Lock
        )
        Spacer(Modifier.height(10.dp))
        OutlineAction("Pair a new device", onPair, Modifier.fillMaxWidth(), Icons.Outlined.Link)
    }
}

@Composable
fun PairingScreen(
    state: NodeUiState,
    onBack: () -> Unit,
    onPair: (String, String) -> Unit,
    onDismiss: () -> Unit
) {
    var payload by remember { mutableStateOf("") }
    var name by remember(state.deviceName) { mutableStateOf(state.deviceName) }
    ScreenScaffold("Device pairing", onBack) { padding ->
        LazyColumn(
            Modifier.fillMaxSize().padding(padding).padding(horizontal = 20.dp),
            contentPadding = PaddingValues(vertical = 20.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item { NoticeArea(state, onDismiss) }
            item {
                GlassCard {
                    Icon(Icons.Outlined.Fingerprint, null, modifier = Modifier.size(42.dp))
                    Spacer(Modifier.height(18.dp))
                    Text("Link this phone.", style = MaterialTheme.typography.headlineMedium, modifier = Modifier.semantics { heading() })
                    Text(
                        "Paste the JSON payload from the pairing QR. It must contain pairing_code and may include endpoint.",
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(Modifier.height(20.dp))
                    OutlinedTextField(
                        value = name,
                        onValueChange = { name = it },
                        label = { Text("Device name") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(Modifier.height(12.dp))
                    OutlinedTextField(
                        value = payload,
                        onValueChange = { payload = it },
                        label = { Text("Pairing QR payload") },
                        minLines = 4,
                        supportingText = { Text("""Example: {"pairing_code":"...","endpoint":"https://..."}""") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(Modifier.height(18.dp))
                    PrimaryAction(
                        "Pair device",
                        { onPair(payload, name) },
                        Modifier.fillMaxWidth(),
                        Icons.Outlined.Link,
                        loading = state.operationInProgress
                    )
                }
            }
            item {
                GlassCard {
                    SectionLabel("Backend contract")
                    Spacer(Modifier.height(8.dp))
                    Text("POST /device/register", style = MaterialTheme.typography.titleMedium)
                    Text(
                        "The app stores the returned token and device_id in encrypted preferences, then syncs capabilities.",
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}

@Composable
fun DashboardScreen(
    state: NodeUiState,
    onNavigate: (String) -> Unit,
    onReconnect: () -> Unit,
    onHeartbeat: () -> Unit,
    onServiceChanged: (Boolean) -> Unit,
    onDismiss: () -> Unit
) {
    ScreenScaffold("Drishti Node", null, actions = {
        SocketStatusPill(state.connection.status)
    }) { padding ->
        BoxWithConstraints(Modifier.fillMaxSize().padding(padding)) {
            val wide = maxWidth >= 700.dp
            val body: @Composable () -> Unit = {
                DashboardOverview(state, onReconnect, onHeartbeat, onServiceChanged, onDismiss)
            }
            if (wide) {
                Row(Modifier.fillMaxSize()) {
                    DashboardMenu(onNavigate, Modifier.width(260.dp).fillMaxSize())
                    Box(Modifier.weight(1f)) { body() }
                }
            } else {
                Column(Modifier.fillMaxSize()) {
                    Box(Modifier.weight(1f)) { body() }
                    CompactDashboardMenu(onNavigate)
                }
            }
        }
    }
}

@Composable
private fun DashboardOverview(
    state: NodeUiState,
    onReconnect: () -> Unit,
    onHeartbeat: () -> Unit,
    onServiceChanged: (Boolean) -> Unit,
    onDismiss: () -> Unit
) {
    LazyColumn(
        Modifier.fillMaxSize(),
        contentPadding = PaddingValues(20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item { NoticeArea(state, onDismiss) }
        if (state.connection.status == SocketStatus.RECONNECTING || state.connection.status == SocketStatus.ERROR) {
            item {
                NoticeBanner(
                    state.connection.error ?: "Gateway unavailable. Reconnecting automatically.",
                    error = state.connection.status == SocketStatus.ERROR,
                    warning = state.connection.status == SocketStatus.RECONNECTING,
                    onDismiss = onDismiss
                )
            }
        }
        item {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.Top) {
                Column(Modifier.weight(1f)) {
                    SectionLabel("Current status")
                    Text(
                        if (state.connection.status == SocketStatus.CONNECTED) "Quietly connected." else "Node is offline.",
                        style = MaterialTheme.typography.headlineLarge,
                        modifier = Modifier.semantics { heading() }
                    )
                    Text(
                        state.deviceName,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        style = MaterialTheme.typography.bodyLarge
                    )
                }
                StatusPill(
                    if (state.connection.status == SocketStatus.CONNECTED) "Online" else "Offline",
                    state.connection.status == SocketStatus.CONNECTED
                )
            }
        }
        item {
            BoxWithConstraints(Modifier.fillMaxWidth()) {
                if (maxWidth >= 560.dp) {
                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        MetricTile("Backend", state.backendUrl.hostLabel(), Modifier.weight(1f))
                        MetricTile("WebSocket", state.connection.status.name, Modifier.weight(1f), statusColor(state.connection.status))
                        MetricTile("Battery", state.batteryLevel?.let { "$it%" } ?: "Unknown", Modifier.weight(1f))
                    }
                } else {
                    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        MetricTile("Backend", state.backendUrl.hostLabel(), Modifier.fillMaxWidth())
                        MetricTile("WebSocket", state.connection.status.name, Modifier.fillMaxWidth(), statusColor(state.connection.status))
                        MetricTile("Battery", state.batteryLevel?.let { "$it%" } ?: "Unknown", Modifier.fillMaxWidth())
                    }
                }
            }
        }
        item {
            GlassCard {
                Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Outlined.Memory, null, modifier = Modifier.size(30.dp))
                    Spacer(Modifier.width(14.dp))
                    Column(Modifier.weight(1f)) {
                        Text("Drishti service", style = MaterialTheme.typography.titleLarge)
                        Text(
                            if (state.serviceRunning) "Core node daemon is active" else "Telemetry and heartbeat are paused",
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    Switch(
                        checked = state.serviceRunning,
                        onCheckedChange = onServiceChanged,
                        modifier = Modifier.semantics { }
                    )
                }
            }
        }
        item {
            GlassCard {
                SectionLabel("Heartbeat")
                Spacer(Modifier.height(12.dp))
                StatusRow("Last sent", formatTimestamp(state.connection.lastHeartbeatSentAt))
                StatusRow("Last acknowledged", formatTimestamp(state.connection.lastHeartbeatAckAt))
                StatusRow("Reconnect attempts", state.connection.reconnectAttempt.toString())
                Spacer(Modifier.height(16.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlineAction("Reconnect", onReconnect, Modifier.weight(1f), Icons.Outlined.Refresh)
                    PrimaryAction("Heartbeat", onHeartbeat, Modifier.weight(1f), Icons.Outlined.Sync)
                }
            }
        }
        item {
            GlassCard {
                SectionLabel("Operational health")
                Spacer(Modifier.height(12.dp))
                StatusRow("Authentication", if (state.authenticated) "Encrypted session active" else "Signed out", state.authenticated)
                StatusRow("Permissions", "${state.permissions.count { it.granted }} of ${state.permissions.size} healthy", state.permissions.all { it.granted })
                StatusRow("Telemetry", "${state.telemetry.count { it.active }} of ${state.telemetry.size} collectors ready", state.telemetry.all { it.active })
            }
        }
    }
}

@Composable
fun ConnectionScreen(state: NodeUiState, onBack: () -> Unit, onReconnect: () -> Unit, onHeartbeat: () -> Unit) {
    ScreenScaffold("Connection status", onBack) { padding ->
        LazyColumn(
            Modifier.fillMaxSize().padding(padding),
            contentPadding = PaddingValues(20.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                GlassCard {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            SectionLabel("Realtime gateway")
                            Text("WebSocket health", style = MaterialTheme.typography.headlineMedium)
                        }
                        SocketStatusPill(state.connection.status)
                    }
                    Spacer(Modifier.height(22.dp))
                    StatusRow("Backend", state.backendUrl)
                    StatusRow("Transport", if (state.backendUrl.startsWith("https")) "WSS encrypted" else "WS local development")
                    StatusRow("Last message", formatTimestamp(state.connection.lastMessageAt))
                    StatusRow("Heartbeat sent", formatTimestamp(state.connection.lastHeartbeatSentAt))
                    StatusRow("Heartbeat ACK", formatTimestamp(state.connection.lastHeartbeatAckAt))
                    StatusRow("Reconnect attempt", state.connection.reconnectAttempt.toString())
                }
            }
            state.connection.error?.let { error ->
                item { NoticeBanner(error, error = true, onDismiss = onReconnect) }
            }
            item {
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlineAction("Reconnect", onReconnect, Modifier.weight(1f), Icons.Outlined.Refresh)
                    PrimaryAction("Send heartbeat", onHeartbeat, Modifier.weight(1f), Icons.Outlined.Sync)
                }
            }
        }
    }
}

@Composable
fun TelemetryScreen(state: NodeUiState, onBack: () -> Unit) {
    ScreenScaffold("Telemetry status", onBack) { padding ->
        LazyColumn(
            Modifier.fillMaxSize().padding(padding),
            contentPadding = PaddingValues(20.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item {
                ScreenIntro(
                    "On-device signals.",
                    "Collectors publish deltas in five-second batches through the device WebSocket.",
                    Icons.Outlined.Sensors
                )
            }
            items(state.telemetry) { telemetry ->
                GlassCard {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            Modifier.size(10.dp).background(if (telemetry.active) Emerald400 else Amber400, CircleShape)
                        )
                        Spacer(Modifier.width(14.dp))
                        Column(Modifier.weight(1f)) {
                            Text(telemetry.name, style = MaterialTheme.typography.titleMedium)
                            Text(telemetry.detail, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        StatusPill(if (telemetry.active) "Ready" else "Needs access", telemetry.active, !telemetry.active)
                    }
                }
            }
        }
    }
}

@Composable
fun PermissionHealthScreen(state: NodeUiState, onBack: () -> Unit) {
    val context = LocalContext.current
    val runtimePermissions = state.permissions.filter { !it.settingsOnly && !it.granted }.map { it.key }.toTypedArray()
    val permissionLauncher = rememberLauncherForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { }
    ScreenScaffold("Permission health", onBack) { padding ->
        LazyColumn(
            Modifier.fillMaxSize().padding(padding),
            contentPadding = PaddingValues(20.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item {
                ScreenIntro(
                    "Permission health.",
                    "Drishti keeps unavailable collectors visible and never reports them as active.",
                    Icons.Outlined.HealthAndSafety
                )
            }
            items(state.permissions) { permission ->
                PermissionCard(permission) {
                    when (permission.key) {
                        "notification_access" -> context.startActivity(Intent("android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS"))
                        "accessibility" -> context.startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS))
                        else -> permissionLauncher.launch(arrayOf(permission.key))
                    }
                }
            }
            if (runtimePermissions.isNotEmpty()) {
                item {
                    PrimaryAction(
                        "Request runtime permissions",
                        { permissionLauncher.launch(runtimePermissions) },
                        Modifier.fillMaxWidth(),
                        Icons.Outlined.Security
                    )
                }
            }
        }
    }
}

@Composable
fun AlwaysRememberScreen(
    state: NodeUiState,
    onBack: () -> Unit,
    onSave: (String, Boolean, Boolean) -> Unit
) {
    var backend by remember(state.backendUrl) { mutableStateOf(state.backendUrl) }
    var rememberSession by remember(state.alwaysRemember) { mutableStateOf(state.alwaysRemember) }
    var darkMode by remember(state.darkMode) { mutableStateOf(state.darkMode) }
    ScreenScaffold("Always Remember", onBack) { padding ->
        Column(
            Modifier.fillMaxSize().padding(padding).verticalScroll(rememberScrollState()).padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            ScreenIntro(
                "Stay quietly ready.",
                "The device token is encrypted at rest. Enabling Always Remember restores the node service on app launch.",
                Icons.Outlined.Fingerprint
            )
            GlassCard {
                SettingToggle("Always Remember", "Restore the encrypted session and reconnect automatically.", rememberSession) {
                    rememberSession = it
                }
                HorizontalDivider()
                SettingToggle("Dark appearance", "Use Drishti's zinc interface. Light mode remains available.", darkMode) {
                    darkMode = it
                }
            }
            GlassCard {
                SectionLabel("Gateway")
                Spacer(Modifier.height(10.dp))
                OutlinedTextField(
                    value = backend,
                    onValueChange = { backend = it },
                    label = { Text("Backend URL") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Uri),
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
            }
            PrimaryAction("Save settings", { onSave(backend, rememberSession, darkMode) }, Modifier.fillMaxWidth())
        }
    }
}

@Composable
fun DiagnosticsScreen(state: NodeUiState, onBack: () -> Unit, onRefresh: () -> Unit) {
    LaunchedEffect(Unit) { onRefresh() }
    ScreenScaffold("Diagnostics", onBack) { padding ->
        LazyColumn(
            Modifier.fillMaxSize().padding(padding),
            contentPadding = PaddingValues(20.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                ScreenIntro(
                    "Operational visibility.",
                    "Privacy-safe counters and local health details for troubleshooting.",
                    Icons.Outlined.BugReport
                )
            }
            item {
                GlassCard {
                    SectionLabel("Health report")
                    Spacer(Modifier.height(12.dp))
                    Text(
                        state.diagnostics.ifBlank { "Generating report..." },
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
            item {
                GlassCard {
                    StatusRow("App version", BuildConfig.VERSION_NAME)
                    StatusRow("Device ID", state.deviceId ?: "Not assigned")
                    StatusRow("Session", if (state.authenticated) "Active" else "Signed out", state.authenticated)
                    StatusRow("Socket", state.connection.status.name, state.connection.status == SocketStatus.CONNECTED)
                }
            }
            item { OutlineAction("Refresh report", onRefresh, Modifier.fillMaxWidth(), Icons.Outlined.Refresh) }
        }
    }
}

@Composable
fun SettingsLogoutScreen(
    state: NodeUiState,
    onBack: () -> Unit,
    onRememberSettings: () -> Unit,
    onPermissions: () -> Unit,
    onLogout: () -> Unit
) {
    val context = LocalContext.current
    ScreenScaffold("Settings", onBack) { padding ->
        LazyColumn(
            Modifier.fillMaxSize().padding(padding),
            contentPadding = PaddingValues(20.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                GlassCard {
                    SectionLabel("Node identity")
                    Spacer(Modifier.height(10.dp))
                    Text(state.deviceName, style = MaterialTheme.typography.headlineMedium)
                    Text(state.deviceId ?: "No backend device ID", color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Spacer(Modifier.height(14.dp))
                    StatusPill(if (state.authenticated) "Session active" else "Signed out", state.authenticated)
                }
            }
            item {
                SettingsLink("Always Remember", "Session, backend and appearance", Icons.Outlined.Fingerprint, onRememberSettings)
                SettingsLink("Permission health", "Review telemetry access", Icons.Outlined.HealthAndSafety, onPermissions)
                SettingsLink("App system settings", "Notifications, battery and permissions", Icons.Outlined.Settings) {
                    context.startActivity(
                        Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:${context.packageName}"))
                    )
                }
            }
            item {
                OutlineAction("Log out and stop node", onLogout, Modifier.fillMaxWidth(), Icons.Outlined.Logout)
                Text(
                    "Logout clears the encrypted device token and stops the foreground service.",
                    modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                    textAlign = TextAlign.Center,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    style = MaterialTheme.typography.bodySmall
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ScreenScaffold(
    title: String,
    onBack: (() -> Unit)?,
    actions: @Composable () -> Unit = {},
    content: @Composable (PaddingValues) -> Unit
) {
    Scaffold(
        containerColor = MaterialTheme.colorScheme.background,
        topBar = {
            TopAppBar(
                title = {
                    Text(title.uppercase(), style = MaterialTheme.typography.labelLarge)
                },
                navigationIcon = {
                    if (onBack != null) {
                        IconButton(onClick = onBack) {
                            Icon(Icons.Outlined.ArrowBack, "Go back")
                        }
                    }
                },
                actions = { Box(Modifier.padding(end = 12.dp)) { actions() } },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background.copy(alpha = 0.96f)
                ),
                modifier = Modifier.statusBarsPadding()
            )
        },
        content = content
    )
}

@Composable
private fun CenteredAuthLayout(content: @Composable ColumnScope.() -> Unit) {
    Box(Modifier.fillMaxSize()) {
        DottedBackground()
        Box(
            Modifier.fillMaxSize().statusBarsPadding().navigationBarsPadding().padding(20.dp),
            contentAlignment = Alignment.Center
        ) {
            GlassCard(Modifier.fillMaxWidth().widthIn(max = 480.dp), content)
        }
    }
}

@Composable
private fun NoticeArea(state: NodeUiState, onDismiss: () -> Unit) {
    state.error?.let {
        NoticeBanner(it, error = true, onDismiss = onDismiss)
        Spacer(Modifier.height(14.dp))
    }
    state.message?.let {
        NoticeBanner(it, error = false, onDismiss = onDismiss)
        Spacer(Modifier.height(14.dp))
    }
}

@Composable
private fun StatusRow(label: String, value: String, healthy: Boolean? = null) {
    Row(
        Modifier.fillMaxWidth().padding(vertical = 9.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(label, color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodyMedium)
        Text(
            value,
            modifier = Modifier.padding(start = 16.dp),
            color = when (healthy) {
                true -> Emerald400
                false -> Red400
                null -> MaterialTheme.colorScheme.onSurface
            },
            style = MaterialTheme.typography.titleMedium,
            textAlign = TextAlign.End
        )
    }
}

@Composable
private fun SettingToggle(
    title: String,
    detail: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    Row(
        Modifier.fillMaxWidth().padding(vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(Modifier.weight(1f)) {
            Text(title, style = MaterialTheme.typography.titleMedium)
            Text(detail, color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodySmall)
        }
        Switch(checked = checked, onCheckedChange = onCheckedChange)
    }
}

@Composable
private fun PermissionCard(permission: PermissionStatus, onOpen: () -> Unit) {
    GlassCard {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
                if (permission.granted) Icons.Outlined.CheckCircle else Icons.Outlined.Warning,
                null,
                tint = if (permission.granted) Emerald400 else Amber400,
                modifier = Modifier.size(28.dp)
            )
            Spacer(Modifier.width(14.dp))
            Column(Modifier.weight(1f)) {
                Text(permission.title, style = MaterialTheme.typography.titleMedium)
                Text(permission.description, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            if (permission.granted) {
                StatusPill("Granted", true)
            } else {
                IconButton(onClick = onOpen) { Icon(Icons.Outlined.ChevronRight, "Open ${permission.title} settings") }
            }
        }
    }
}

@Composable
private fun ScreenIntro(title: String, detail: String, icon: androidx.compose.ui.graphics.vector.ImageVector) {
    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        Box(
            Modifier.size(52.dp).background(MaterialTheme.colorScheme.surfaceVariant, CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Icon(icon, null, modifier = Modifier.size(26.dp))
        }
        Spacer(Modifier.width(16.dp))
        Column {
            Text(title, style = MaterialTheme.typography.headlineMedium, modifier = Modifier.semantics { heading() })
            Text(detail, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@Composable
private fun DashboardMenu(onNavigate: (String) -> Unit, modifier: Modifier = Modifier) {
    Column(
        modifier.background(MaterialTheme.colorScheme.surface).padding(14.dp),
        verticalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        SectionLabel("Node console", Modifier.padding(10.dp))
        MenuButton("Overview", Icons.Outlined.Home) { }
        MenuButton("Connection", Icons.Outlined.CloudQueue) { onNavigate("connection") }
        MenuButton("Telemetry", Icons.Outlined.Sensors) { onNavigate("telemetry") }
        MenuButton("Permissions", Icons.Outlined.HealthAndSafety) { onNavigate("permissions") }
        MenuButton("Diagnostics", Icons.Outlined.BugReport) { onNavigate("diagnostics") }
        Spacer(Modifier.weight(1f))
        MenuButton("Settings", Icons.Outlined.Settings) { onNavigate("settings") }
    }
}

@Composable
private fun CompactDashboardMenu(onNavigate: (String) -> Unit) {
    Row(
        Modifier.fillMaxWidth().navigationBarsPadding().background(MaterialTheme.colorScheme.surface).padding(8.dp),
        horizontalArrangement = Arrangement.SpaceAround
    ) {
        CompactMenuButton("Connection", Icons.Outlined.CloudQueue) { onNavigate("connection") }
        CompactMenuButton("Telemetry", Icons.Outlined.Sensors) { onNavigate("telemetry") }
        CompactMenuButton("Permissions", Icons.Outlined.HealthAndSafety) { onNavigate("permissions") }
        CompactMenuButton("Settings", Icons.Outlined.Settings) { onNavigate("settings") }
    }
}

@Composable
private fun MenuButton(label: String, icon: androidx.compose.ui.graphics.vector.ImageVector, onClick: () -> Unit) {
    OutlineAction(label, onClick, Modifier.fillMaxWidth(), icon)
}

@Composable
private fun CompactMenuButton(label: String, icon: androidx.compose.ui.graphics.vector.ImageVector, onClick: () -> Unit) {
    IconButton(onClick = onClick, modifier = Modifier.semantics { }) {
        Icon(icon, contentDescription = label)
    }
}

@Composable
private fun SettingsLink(
    title: String,
    detail: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    onClick: () -> Unit
) {
    GlassCard(Modifier.fillMaxWidth()) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(icon, null)
            Spacer(Modifier.width(14.dp))
            Column(Modifier.weight(1f)) {
                Text(title, style = MaterialTheme.typography.titleMedium)
                Text(detail, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            IconButton(onClick = onClick) { Icon(Icons.Outlined.ChevronRight, "Open $title") }
        }
    }
    Spacer(Modifier.height(10.dp))
}

private fun formatTimestamp(timestamp: Long?): String =
    timestamp?.let { DateFormat.getDateTimeInstance(DateFormat.SHORT, DateFormat.MEDIUM).format(Date(it)) } ?: "Not yet"

private fun String.hostLabel(): String = runCatching { Uri.parse(this).host }.getOrNull() ?: this.ifBlank { "Not configured" }

private fun statusColor(status: SocketStatus): Color = when (status) {
    SocketStatus.CONNECTED -> Emerald400
    SocketStatus.CONNECTING, SocketStatus.RECONNECTING -> Amber400
    else -> Red400
}
