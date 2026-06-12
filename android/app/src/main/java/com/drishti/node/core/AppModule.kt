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
}
