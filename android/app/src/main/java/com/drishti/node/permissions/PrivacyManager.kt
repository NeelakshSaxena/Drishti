package com.drishti.node.permissions

import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class PrivacyManager @Inject constructor() {
    private val blockedPackages = setOf(
        "com.android.systemui",
        "android",
        "com.google.android.settings",
        "com.whatsapp" // Example blocked privacy app
    )

    private val blockedCategories = setOf(
        "sys", "err", "status"
    )

    fun isNotificationAllowed(packageName: String, category: String?): Boolean {
        if (blockedPackages.contains(packageName)) return false
        if (category != null && blockedCategories.contains(category)) return false
        return true
    }

    fun isMediaTrackingAllowed(packageName: String): Boolean {
        // Allow all media unless explicitly blocked
        return !blockedPackages.contains(packageName)
    }
}
