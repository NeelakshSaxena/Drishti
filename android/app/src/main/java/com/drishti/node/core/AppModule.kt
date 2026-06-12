package com.drishti.node.core

import android.content.Context
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Singleton
import com.drishti.node.networking.WebSocketManager
import com.drishti.node.storage.LogStorage
import com.drishti.node.networking.AuthTokenManager
import com.drishti.node.telemetry.TelemetryManager
import com.drishti.node.telemetry.collectors.*
import com.drishti.node.permissions.PermissionHelper
import com.drishti.node.permissions.PrivacyManager
import com.drishti.node.audio.WakeWordEngine
import com.drishti.node.audio.VadEngine
import com.drishti.node.audio.AudioCollector

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideLogStorage(@ApplicationContext context: Context): LogStorage {
        return LogStorage(context)
    }

    @Provides
    @Singleton
    fun provideAuthTokenManager(): AuthTokenManager {
        return AuthTokenManager()
    }

    @Provides
    @Singleton
    fun provideWebSocketManager(
        authTokenManager: AuthTokenManager,
        logStorage: LogStorage
    ): WebSocketManager {
        return WebSocketManager(authTokenManager, logStorage)
    }
    
    @Provides
    @Singleton
    fun providePermissionHelper(@ApplicationContext context: Context): PermissionHelper {
        return PermissionHelper(context)
    }

    @Provides
    @Singleton
    fun providePrivacyManager(): PrivacyManager {
        return PrivacyManager()
    }

    @Provides
    @Singleton
    fun provideWakeWordEngine(): WakeWordEngine {
        return WakeWordEngine()
    }
    
    @Provides
    @Singleton
    fun provideVadEngine(): VadEngine {
        return VadEngine()
    }

    @Provides
    @Singleton
    fun provideAudioCollector(
        @ApplicationContext context: Context,
        permissionHelper: PermissionHelper,
        webSocketManager: WebSocketManager,
        wakeWordEngine: WakeWordEngine,
        vadEngine: VadEngine
    ): AudioCollector {
        return AudioCollector(context, permissionHelper, webSocketManager, wakeWordEngine, vadEngine)
    }

    @Provides
    @Singleton
    fun provideTelemetryManager(
        @ApplicationContext context: Context,
        webSocketManager: WebSocketManager,
        permissionHelper: PermissionHelper
    ): TelemetryManager {
        val collectors = listOf(
            BatteryCollector(context),
            NetworkCollector(context),
            ScreenStateCollector(context),
            LocationCollector(context, permissionHelper),
            BluetoothCollector(context),
            NotificationCollector(),
            MediaPlaybackCollector(),
            AccessibilityCollector()
        )
        return TelemetryManager(collectors, webSocketManager)
    }
}
