package com.drishti.node.services

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import com.drishti.node.telemetry.NotificationEventBus
import com.drishti.node.telemetry.models.TelemetryEvent
import com.drishti.node.permissions.PrivacyManager
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class DrishtiAccessibilityService : AccessibilityService() {

    @Inject lateinit var privacyManager: PrivacyManager
    
    private var lastExtractedTime = 0L
    private val THROTTLE_MS = 2000L // Strict throttling, max 1 extraction per 2 seconds

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null) return
        
        val packageName = event.packageName?.toString() ?: return
        if (!privacyManager.isNotificationAllowed(packageName, null)) return // Reuse blocklist
        
        val eventType = event.eventType
        
        if (eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            emitForegroundApp(packageName)
        }
        
        // Only parse text if throttled time passed (privacy and CPU saving)
        val now = System.currentTimeMillis()
        if (now - lastExtractedTime > THROTTLE_MS && 
            (eventType == AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED || eventType == AccessibilityEvent.TYPE_VIEW_CLICKED)) {
            lastExtractedTime = now
            val rootNode = rootInActiveWindow
            if (rootNode != null) {
                val extractedText = mutableListOf<String>()
                extractText(rootNode, extractedText)
                
                if (extractedText.isNotEmpty()) {
                    emitExtractedText(packageName, extractedText.take(10)) // Max 10 strings
                }
            }
        }
    }

    override fun onInterrupt() {
        // Required override, do nothing
    }
    
    private fun extractText(node: AccessibilityNodeInfo, textList: MutableList<String>) {
        if (textList.size >= 10) return
        
        if (node.text != null && node.text.isNotBlank()) {
            textList.add(node.text.toString())
        } else if (node.contentDescription != null && node.contentDescription.isNotBlank()) {
            textList.add(node.contentDescription.toString())
        }
        
        for (i in 0 until node.childCount) {
            val child = node.getChild(i)
            if (child != null) {
                extractText(child, textList)
                child.recycle()
            }
        }
    }

    private fun emitForegroundApp(packageName: String) {
        val event = TelemetryEvent(
            type = "foreground_app",
            timestamp = System.currentTimeMillis(),
            data = mapOf("packageName" to packageName)
        )
        NotificationEventBus.emitEvent(event)
    }

    private fun emitExtractedText(packageName: String, texts: List<String>) {
        val event = TelemetryEvent(
            type = "ui_text_extracted",
            timestamp = System.currentTimeMillis(),
            data = mapOf("packageName" to packageName, "texts" to texts)
        )
        NotificationEventBus.emitEvent(event)
    }
}
