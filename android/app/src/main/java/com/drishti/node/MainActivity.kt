package com.drishti.node

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.drishti.node.diagnostics.DiagnosticsLogger
import com.drishti.node.diagnostics.DiagnosticsManager
import com.drishti.node.services.NodeForegroundService

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        DiagnosticsLogger.log("MainActivity", "Starting application, user email is user@example.com, token=secret123")
        
        val serviceIntent = Intent(this, NodeForegroundService::class.java)
        startForegroundService(serviceIntent)
        
        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(32, 32, 32, 32)
        }
        
        val title = TextView(this).apply {
            text = "Drishti Node Diagnostics Dashboard"
            textSize = 20f
        }
        layout.addView(title)
        
        val reportView = TextView(this).apply {
            text = DiagnosticsManager.generateHealthReport(this@MainActivity)
            setPadding(0, 32, 0, 32)
        }
        layout.addView(reportView)
        
        val btnRefresh = Button(this).apply {
            text = "Refresh Metrics"
            setOnClickListener {
                DiagnosticsManager.recordTelemetrySent()
                reportView.text = DiagnosticsManager.generateHealthReport(this@MainActivity)
            }
        }
        layout.addView(btnRefresh)
        
        val btnExport = Button(this).apply {
            text = "Export Diagnostics"
            setOnClickListener {
                val file = DiagnosticsLogger.exportLogs(this@MainActivity)
                reportView.text = "Exported to: ${file.absolutePath}\n\n${file.readText()}"
            }
        }
        layout.addView(btnExport)
        
        val btnCrash = Button(this).apply {
            text = "Test Crash"
            setOnClickListener {
                throw RuntimeException("Test crash from Dashboard!")
            }
        }
        layout.addView(btnCrash)
        
        val scroll = ScrollView(this).apply {
            addView(layout)
        }
        
        setContentView(scroll)
    }
}
