package com.drishti.node.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.drishti.node.screens.AlwaysRememberScreen
import com.drishti.node.screens.ConnectionScreen
import com.drishti.node.screens.DashboardScreen
import com.drishti.node.screens.DiagnosticsScreen
import com.drishti.node.screens.LoginScreen
import com.drishti.node.screens.PairingScreen
import com.drishti.node.screens.PermissionHealthScreen
import com.drishti.node.screens.SettingsLogoutScreen
import com.drishti.node.screens.SplashScreen
import com.drishti.node.screens.TelemetryScreen
import com.drishti.node.ui.NodeUiState
import com.drishti.node.ui.NodeViewModel

@Composable
fun DrishtiNavGraph(
    navController: NavHostController,
    state: NodeUiState,
    viewModel: NodeViewModel
) {
    val back: () -> Unit = { navController.popBackStack() }
    val open: (String) -> Unit = { route -> navController.navigate(route) }
    NavHost(navController = navController, startDestination = Destination.Splash.route) {
        composable(Destination.Splash.route) {
            SplashScreen(state) { restored ->
                navController.navigate(if (restored) Destination.Dashboard.route else Destination.Login.route) {
                    popUpTo(Destination.Splash.route) { inclusive = true }
                }
            }
        }
        composable(Destination.Login.route) {
            LoginScreen(
                state = state,
                onLogin = { token, name, backend, remember ->
                    viewModel.loginWithDeviceToken(token, name, backend, remember)
                    navController.navigate(Destination.Dashboard.route) {
                        popUpTo(Destination.Login.route) { inclusive = true }
                    }
                },
                onPair = { navController.navigate(Destination.Pairing.route) },
                onDismiss = viewModel::clearNotice
            )
        }
        composable(Destination.Pairing.route) {
            LaunchedEffect(state.authenticated, state.operationInProgress) {
                if (state.authenticated && !state.operationInProgress) {
                    navController.navigate(Destination.Dashboard.route) {
                        popUpTo(Destination.Login.route) { inclusive = true }
                    }
                }
            }
            PairingScreen(
                state,
                back,
                onPair = viewModel::pairDevice,
                onDismiss = viewModel::clearNotice
            )
        }
        composable(Destination.Dashboard.route) {
            DashboardScreen(
                state = state,
                onNavigate = open,
                onReconnect = viewModel::reconnect,
                onHeartbeat = viewModel::sendHeartbeat,
                onServiceChanged = viewModel::setServiceRunning,
                onDismiss = viewModel::clearNotice
            )
        }
        composable(Destination.Connection.route) {
            ConnectionScreen(state, back, viewModel::reconnect, viewModel::sendHeartbeat)
        }
        composable(Destination.Telemetry.route) {
            TelemetryScreen(state, back)
        }
        composable(Destination.Permissions.route) {
            PermissionHealthScreen(state, back)
        }
        composable(Destination.AlwaysRemember.route) {
            AlwaysRememberScreen(state, back, viewModel::saveSettings)
        }
        composable(Destination.Diagnostics.route) {
            DiagnosticsScreen(state, back, viewModel::refreshDiagnostics)
        }
        composable(Destination.Settings.route) {
            SettingsLogoutScreen(
                state = state,
                onBack = back,
                onRememberSettings = { navController.navigate(Destination.AlwaysRemember.route) },
                onPermissions = { navController.navigate(Destination.Permissions.route) },
                onLogout = {
                    viewModel.logout()
                    navController.navigate(Destination.Login.route) {
                        popUpTo(0)
                    }
                }
            )
        }
    }
}
