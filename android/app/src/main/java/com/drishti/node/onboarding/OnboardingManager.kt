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

data class PairingResult(val token: String, val deviceId: String?, val endpoint: String)

@Singleton
class OnboardingManager @Inject constructor(
    private val authTokenManager: AuthTokenManager,
    private val permissionHelper: PermissionHelper
) {
    suspend fun processQrPayload(
        qrPayload: String,
        deviceName: String,
        alwaysRemember: Boolean = true
    ): Result<PairingResult> = withContext(Dispatchers.IO) {
        runCatching {
            val qrJson = JSONObject(qrPayload)
            val pairingCode = qrJson.getString("pairing_code")
            val endpoint = qrJson.optString("endpoint", authTokenManager.getBackendUrl()).trimEnd('/')
            val registration = postJson(
                "$endpoint/device/register",
                JSONObject().put("pairing_code", pairingCode).put("name", deviceName)
            )
            val token = registration.getString("token")
            val deviceId = registration.optString("device_id").ifBlank { null }
            authTokenManager.saveSession(token, deviceId, deviceName, endpoint, alwaysRemember)
            syncCapabilities(endpoint, token)
            PairingResult(token, deviceId, endpoint)
        }
    }

    private fun syncCapabilities(endpoint: String, token: String) {
        val payload = JSONObject()
            .put("capabilities", listOf("audio", "telemetry", "notifications"))
            .put("health", JSONObject(permissionHelper.getHealthReport()))
        runCatching { postJson("$endpoint/device/sync", payload, token) }
    }

    private fun postJson(url: String, payload: JSONObject, token: String? = null): JSONObject {
        val connection = URL(url).openConnection() as HttpURLConnection
        connection.requestMethod = "POST"
        connection.connectTimeout = 15_000
        connection.readTimeout = 15_000
        connection.setRequestProperty("Content-Type", "application/json")
        token?.let { connection.setRequestProperty("Authorization", "Bearer $it") }
        connection.doOutput = true
        connection.outputStream.use { it.write(payload.toString().toByteArray()) }
        val body = (if (connection.responseCode in 200..299) connection.inputStream else connection.errorStream)
            ?.bufferedReader()?.use { it.readText() }.orEmpty()
        if (connection.responseCode !in 200..299) {
            val detail = runCatching { JSONObject(body).optString("detail") }.getOrNull()
            error(detail?.takeIf { it.isNotBlank() } ?: "Pairing failed (HTTP ${connection.responseCode})")
        }
        return JSONObject(body)
    }
}
