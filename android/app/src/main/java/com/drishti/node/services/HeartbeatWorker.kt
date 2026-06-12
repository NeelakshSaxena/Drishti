package com.drishti.node.services

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject
import com.drishti.node.networking.WebSocketManager

@HiltWorker
class HeartbeatWorker @AssistedInject constructor(
    @Assisted appContext: Context,
    @Assisted workerParams: WorkerParameters,
    private val webSocketManager: WebSocketManager
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result {
        // Fallback execution when service might be killed
        webSocketManager.connect()
        webSocketManager.send("{\"type\": \"worker_heartbeat\"}")
        return Result.success()
    }
}
