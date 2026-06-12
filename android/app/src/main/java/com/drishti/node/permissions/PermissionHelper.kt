package com.drishti.node.permissions

import android.content.Context
import android.content.pm.PackageManager
import androidx.core.content.ContextCompat

class PermissionHelper(private val context: Context) {
    fun hasPermission(permission: String): Boolean {
        return ContextCompat.checkSelfPermission(context, permission) == PackageManager.PERMISSION_GRANTED
    }

    fun getHealthReport(): Map<String, Boolean> {
        val permissionsToCheck = listOf(
            "android.permission.RECORD_AUDIO",
            "android.permission.ACCESS_FINE_LOCATION",
            "android.permission.BIND_NOTIFICATION_LISTENER_SERVICE",
            "android.permission.BLUETOOTH_CONNECT"
        )
        val report = mutableMapOf<String, Boolean>()
        for (p in permissionsToCheck) {
            report[p] = hasPermission(p)
        }
        return report
    }
}
