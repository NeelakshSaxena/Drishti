package com.drishti.node.services

import android.content.ComponentName
import android.media.MediaMetadata
import android.media.session.MediaController
import android.media.session.MediaSessionManager
import android.media.session.PlaybackState
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import com.drishti.node.permissions.PrivacyManager
import com.drishti.node.telemetry.NotificationEventBus
import com.drishti.node.telemetry.models.TelemetryEvent
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class DrishtiNotificationService : NotificationListenerService() {

    @Inject lateinit var privacyManager: PrivacyManager
    private lateinit var mediaSessionManager: MediaSessionManager
    private var mediaControllers = listOf<MediaController>()

    override fun onCreate() {
        super.onCreate()
        mediaSessionManager = getSystemService(MEDIA_SESSION_SERVICE) as MediaSessionManager
    }

    override fun onListenerConnected() {
        super.onListenerConnected()
        registerMediaControllers()
    }

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        val packageName = sbn.packageName
        val category = sbn.notification.category

        if (!privacyManager.isNotificationAllowed(packageName, category)) {
            return
        }

        val event = TelemetryEvent(
            type = "notification",
            timestamp = sbn.postTime,
            data = mapOf(
                "sourceApp" to packageName,
                "category" to (category ?: "unknown"),
                "isClearable" to sbn.isClearable
            )
        )
        NotificationEventBus.emitEvent(event)
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification) {
        // Optionally track removed notifications
    }

    private fun registerMediaControllers() {
        try {
            val component = ComponentName(this, DrishtiNotificationService::class.java)
            mediaControllers = mediaSessionManager.getActiveSessions(component)
            
            mediaControllers.forEach { controller ->
                controller.registerCallback(mediaCallback)
            }
            
            mediaSessionManager.addOnActiveSessionsChangedListener({ controllers ->
                mediaControllers.forEach { it.unregisterCallback(mediaCallback) }
                mediaControllers = controllers ?: emptyList()
                mediaControllers.forEach { it.registerCallback(mediaCallback) }
            }, component)
        } catch (e: SecurityException) {
            // Permission not granted
        }
    }

    private val mediaCallback = object : MediaController.Callback() {
        override fun onPlaybackStateChanged(state: PlaybackState?) {
            emitMediaUpdate()
        }

        override fun onMetadataChanged(metadata: MediaMetadata?) {
            emitMediaUpdate()
        }
        
        private fun emitMediaUpdate() {
            mediaControllers.forEach { controller ->
                val packageName = controller.packageName
                if (privacyManager.isMediaTrackingAllowed(packageName)) {
                    val metadata = controller.metadata
                    val playbackState = controller.playbackState
                    
                    val title = metadata?.getString(MediaMetadata.METADATA_KEY_TITLE) ?: "unknown"
                    val artist = metadata?.getString(MediaMetadata.METADATA_KEY_ARTIST) ?: "unknown"
                    val isPlaying = playbackState?.state == PlaybackState.STATE_PLAYING

                    val event = TelemetryEvent(
                        type = "media_session",
                        timestamp = System.currentTimeMillis(),
                        data = mapOf(
                            "sourceApp" to packageName,
                            "title" to title,
                            "artist" to artist,
                            "isPlaying" to isPlaying
                        )
                    )
                    NotificationEventBus.emitEvent(event)
                }
            }
        }
    }
}
