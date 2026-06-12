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
    fun getSecret(): String? = prefs.getString("device_secret", "DEFAULT_SECRET") // Used for HMAC
    fun getExpiry(): Long = prefs.getLong("token_expiry", 0L)
    
    fun saveToken(token: String, secret: String, expiryTimeMs: Long) {
        prefs.edit()
            .putString("jwt_token", token)
            .putString("device_secret", secret)
            .putLong("token_expiry", expiryTimeMs)
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
}
