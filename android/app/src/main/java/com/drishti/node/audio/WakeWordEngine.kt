package com.drishti.node.audio

import java.nio.ByteBuffer
import java.nio.ByteOrder

class WakeWordEngine {
    // Placeholder for a real TFLite / Porcupine engine.
    // For now, relies on simple amplitude thresholding to simulate wake-word hit.
    fun process(audioBuffer: ShortArray, readSize: Int): Boolean {
        var energy = 0L
        for (i in 0 until readSize) {
            energy += Math.abs(audioBuffer[i].toInt())
        }
        val avgEnergy = if (readSize > 0) energy / readSize else 0
        // Arbitrary threshold to mock "wake word detected"
        return avgEnergy > 15000 
    }
}
