package com.drishti.node.telemetry

import com.drishti.node.telemetry.models.TelemetryEvent
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.delay
import java.util.concurrent.ConcurrentHashMap
import com.drishti.node.networking.WebSocketManager

class TelemetryManager(
    private val collectors: List<TelemetryCollector>,
    private val webSocketManager: WebSocketManager
) {
    private val scope = CoroutineScope(Dispatchers.IO)
    private val eventChannel = Channel<TelemetryEvent>(Channel.BUFFERED)
    private val lastEventCache = ConcurrentHashMap<String, TelemetryEvent>()
    private val batchQueue = mutableListOf<TelemetryEvent>()
    
    private var batchJob: Job? = null
    private var collectJobs = mutableListOf<Job>()

    fun start() {
        // Start all collectors
        collectors.forEach { collector ->
            val job = scope.launch {
                collector.startCollecting().collect { event ->
                    processEvent(event)
                }
            }
            collectJobs.add(job)
        }
        
        // Start batch processor (throttles to 1 batch per 5 seconds)
        batchJob = scope.launch {
            while(true) {
                delay(5000)
                flushBatch()
            }
        }
    }
    
    fun stop() {
        collectJobs.forEach { it.cancel() }
        collectJobs.clear()
        batchJob?.cancel()
    }

    private suspend fun processEvent(event: TelemetryEvent) {
        // Delta update logic: Only add to queue if data changed
        val lastEvent = lastEventCache[event.type]
        if (lastEvent == null || lastEvent.data != event.data) {
            lastEventCache[event.type] = event
            synchronized(batchQueue) {
                batchQueue.add(event)
            }
        }
    }
    
    private fun flushBatch() {
        synchronized(batchQueue) {
            if (batchQueue.isNotEmpty()) {
                val batchPayload = buildBatchJson(batchQueue)
                webSocketManager.send(batchPayload)
                batchQueue.clear()
            }
        }
    }
    
    private fun buildBatchJson(events: List<TelemetryEvent>): String {
        // Simple manual JSON stringifier for demo purposes
        // In real project, use Moshi/Gson
        val eventsStr = events.joinToString(",") { ev ->
            val dataStr = ev.data.entries.joinToString(",") { 
                val v = it.value
                val valueStr = if (v is String) "\"$v\"" else v.toString()
                "\"${it.key}\": $valueStr"
            }
            "{\"type\":\"${ev.type}\",\"timestamp\":${ev.timestamp},\"data\":{$dataStr}}"
        }
        return "{\"batch\":[$eventsStr]}"
    }
}
