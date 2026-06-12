package com.drishti.node.networking

class AuthTokenManager {
    fun getToken(): String {
        return "mock-jwt-token"
    }
    
    fun isTokenValid(): Boolean {
        return true
    }
}
