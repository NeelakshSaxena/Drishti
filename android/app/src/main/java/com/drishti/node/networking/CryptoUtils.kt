package com.drishti.node.networking

import android.util.Base64
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec
import java.security.SecureRandom

object CryptoUtils {
    private val random = SecureRandom()

    fun generateNonce(): String {
        val nonceBytes = ByteArray(16)
        random.nextBytes(nonceBytes)
        return Base64.encodeToString(nonceBytes, Base64.NO_WRAP)
    }

    fun signPayload(payload: String, secret: String): String {
        val mac = Mac.getInstance("HmacSHA256")
        val secretKey = SecretKeySpec(secret.toByteArray(), "HmacSHA256")
        mac.init(secretKey)
        val signatureBytes = mac.doFinal(payload.toByteArray())
        return Base64.encodeToString(signatureBytes, Base64.NO_WRAP)
    }
}
