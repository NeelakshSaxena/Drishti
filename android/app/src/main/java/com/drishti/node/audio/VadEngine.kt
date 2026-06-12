package com.drishti.node.audio

class VadEngine {
    private var silenceFrames = 0
    private val SILENCE_THRESHOLD = 50 // frames of silence before cutoff
    private val ENERGY_THRESHOLD = 500

    // Returns true if voice activity is present, false if silence duration exceeded
    fun process(audioBuffer: ShortArray, readSize: Int): Boolean {
        var energy = 0L
        for (i in 0 until readSize) {
            energy += Math.abs(audioBuffer[i].toInt())
        }
        val avgEnergy = if (readSize > 0) energy / readSize else 0

        if (avgEnergy < ENERGY_THRESHOLD) {
            silenceFrames++
        } else {
            silenceFrames = 0
        }
        
        return silenceFrames < SILENCE_THRESHOLD
    }
    
    fun reset() {
        silenceFrames = 0
    }
}
