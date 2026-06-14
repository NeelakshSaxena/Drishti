package com.drishti.node.networking

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

class AuthTokenManager(context: Context) {
    private var prefs: SharedPreferences

    init {
        // Encrypted Storage implementation
        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()
            
        prefs = EncryptedSharedPreferences.create(
            context,
            "drishti_secure_auth",
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }

    fun getToken(): String? = prefs.getString("jwt_token", null)
    fun getSecret(): String? = prefs.getString("device_secret", null)
    fun getExpiry(): Long = prefs.getLong("token_expiry", 0L)
    fun getDeviceId(): String? = prefs.getString("device_id", null)
    fun getDeviceName(): String = prefs.getString("device_name", "Android Node") ?: "Android Node"
    fun getBackendUrl(): String = prefs.getString("backend_url", DEFAULT_BACKEND_URL) ?: DEFAULT_BACKEND_URL
    fun isAlwaysRememberEnabled(): Boolean = prefs.getBoolean("always_remember", true)
    fun isDarkModeEnabled(): Boolean = prefs.getBoolean("dark_mode", true)
    
    fun saveToken(token: String, secret: String, expiryTimeMs: Long) {
        prefs.edit()
            .putString("jwt_token", token)
            .putString("device_secret", secret)
            .putLong("token_expiry", expiryTimeMs)
            .apply()
    }

    fun saveSession(
        token: String,
        deviceId: String?,
        deviceName: String,
        backendUrl: String,
        alwaysRemember: Boolean
    ) {
        prefs.edit()
            .putString("jwt_token", token)
            .putLong("token_expiry", Long.MAX_VALUE)
            .putString("device_id", deviceId)
            .putString("device_name", deviceName)
            .putString("backend_url", backendUrl.trimEnd('/'))
            .putBoolean("always_remember", alwaysRemember)
            .apply()
    }

    fun updateSettings(backendUrl: String, alwaysRemember: Boolean, darkMode: Boolean) {
        prefs.edit()
            .putString("backend_url", backendUrl.trimEnd('/'))
            .putBoolean("always_remember", alwaysRemember)
            .putBoolean("dark_mode", darkMode)
            .apply()
    }
    
    fun clearToken() {
        prefs.edit().clear().apply()
    }
    
    fun isTokenValid(): Boolean {
        val token = getToken()
        val isExpired = System.currentTimeMillis() > getExpiry()
        return token != null && !isExpired
    }

    companion object {
        const val DEFAULT_BACKEND_URL = "https://drishti-walb.onrender.com"
    }
}
