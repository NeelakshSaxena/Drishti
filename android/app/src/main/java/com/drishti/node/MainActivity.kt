package com.drishti.node

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.drishti.node.services.NodeForegroundService

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Basic launch of the foreground service
        val serviceIntent = Intent(this, NodeForegroundService::class.java)
        startForegroundService(serviceIntent)
        finish()
    }
}
