package com.drishti.node.diagnostics

import android.content.Context
import android.util.Log
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

object DiagnosticsLogger {
    private val logEntries = mutableListOf<String>()
    
    fun log(tag: String, message: String) {
        val redactedMessage = redactPii(message)
        val time = SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS", Locale.US).format(Date())
        val entry = "[$time] [$tag] $redactedMessage"
        Log.d(tag, redactedMessage)
        synchronized(logEntries) {
            logEntries.add(entry)
            if (logEntries.size > 1000) {
                logEntries.removeAt(0)
            }
        }
    }
    
    fun logCrash(throwable: Throwable) {
        log("CRASH", "Exception: ${throwable.message}\n${throwable.stackTraceToString()}")
    }
    
    private fun redactPii(message: String): String {
        var result = message.replace(Regex("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}"), "[EMAIL_REDACTED]")
        result = result.replace(Regex("\\b\\d{3}[-.]?\\d{3}[-.]?\\d{4}\\b"), "[PHONE_REDACTED]")
        result = result.replace(Regex("token=[a-zA-Z0-9_-]+"), "token=[TOKEN_REDACTED]")
        return result
    }
    
    fun exportLogs(context: Context): File {
        val file = File(context.cacheDir, "diagnostics_export.txt")
        val content = synchronized(logEntries) { logEntries.joinToString("\n") }
        file.writeText("=== DRISHTI NODE DIAGNOSTICS ===\n\n$content\n")
        return file
    }
}
