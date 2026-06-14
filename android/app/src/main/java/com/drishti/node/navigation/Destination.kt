package com.drishti.node.navigation

sealed class Destination(val route: String) {
    data object Splash : Destination("splash")
    data object Login : Destination("login")
    data object Pairing : Destination("pairing")
    data object Dashboard : Destination("dashboard")
    data object Connection : Destination("connection")
    data object Telemetry : Destination("telemetry")
    data object Permissions : Destination("permissions")
    data object AlwaysRemember : Destination("always_remember")
    data object Diagnostics : Destination("diagnostics")
    data object Settings : Destination("settings")
}
