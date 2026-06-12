package com.drishti.node.storage

import android.content.Context
import android.util.Log

class LogStorage(private val context: Context) {
    fun log(message: String) {
        Log.d("DrishtiNode", message)
        // Store to structured local file or database room logic here
    }
}
