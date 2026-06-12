package com.drishti.node.networking

import android.content.Context
import android.content.SharedPreferences

class AuthTokenManager(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("drishti_auth", Context.MODE_PRIVATE)

    fun getToken(): String? {
        return prefs.getString("jwt_token", null)
    }
    
    fun saveToken(token: String) {
        prefs.edit().putString("jwt_token", token).apply()
    }
    
    fun clearToken() {
        prefs.edit().remove("jwt_token").apply()
    }
    
    fun isTokenValid(): Boolean {
        return getToken() != null
    }
}
