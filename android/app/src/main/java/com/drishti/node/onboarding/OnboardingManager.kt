package com.drishti.node.onboarding

import com.drishti.node.networking.AuthTokenManager
import com.drishti.node.permissions.PermissionHelper
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class OnboardingManager @Inject constructor(
    private val authTokenManager: AuthTokenManager,
    private val permissionHelper: PermissionHelper
) {
    
    suspend fun processQrPayload(qrPayload: String, deviceName: String): Boolean = withContext(Dispatchers.IO) {
        try {
            // QR Payload is expected to be JSON: {"pairing_code": "XYZ123", "endpoint": "http://backend.local"}
            val qrJson = JSONObject(qrPayload)
            val pairingCode = qrJson.getString("pairing_code")
            val endpoint = qrJson.getString("endpoint")

            // 1. Credential Exchange
            val token = exchangeCredentials(endpoint, pairingCode, deviceName)
            if (token != null) {
                authTokenManager.saveToken(token)
                
                // 2. Capability Sync & Permission Health
                syncCapabilities(endpoint, token)
                return@withContext true
            }
            return@withContext false
        } catch (e: Exception) {
            e.printStackTrace()
            return@withContext false
        }
    }

    private fun exchangeCredentials(endpoint: String, pairingCode: String, deviceName: String): String? {
        val url = URL("$endpoint/api/device/register")
        val connection = url.openConnection() as HttpURLConnection
        connection.requestMethod = "POST"
        connection.setRequestProperty("Content-Type", "application/json")
        connection.doOutput = true

        val payload = "{\"pairing_code\": \"$pairingCode\", \"name\": \"$deviceName\"}"
        connection.outputStream.write(payload.toByteArray())

        if (connection.responseCode == 200) {
            val response = connection.inputStream.bufferedReader().readText()
            val json = JSONObject(response)
            return json.getString("token")
        }
        return null
    }

    private fun syncCapabilities(endpoint: String, token: String) {
        val url = URL("$endpoint/api/device/sync")
        val connection = url.openConnection() as HttpURLConnection
        connection.requestMethod = "POST"
        connection.setRequestProperty("Content-Type", "application/json")
        connection.setRequestProperty("Authorization", "Bearer $token")
        connection.doOutput = true

        val healthReport = permissionHelper.getHealthReport()
        val jsonMap = JSONObject(healthReport as Map<*, *>).toString()
        val payload = "{\"capabilities\": [\"audio\", \"telemetry\", \"notifications\"], \"health\": $jsonMap}"
        
        connection.outputStream.write(payload.toByteArray())
        connection.responseCode // execute
    }
}
