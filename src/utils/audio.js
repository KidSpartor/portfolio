// Audio system — ambient atmosphere, scroll sounds, hover/click feedback
// Uses Web Audio API for generative ambient + Howler for sound effects
import { Howl } from 'howler'

let audioCtx = null
let masterGain = null
let ambientGain = null
let sfxGain = null
let isMuted = true // Start muted — browser requires user interaction
let isInitialized = false
let ambientNodes = []

// Create AudioContext on first user interaction
function ensureAudioContext() {
  if (audioCtx) return
  audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  masterGain = audioCtx.createGain()
  masterGain.gain.value = 0
  masterGain.connect(audioCtx.destination)

  ambientGain = audioCtx.createGain()
  ambientGain.gain.value = 0.25
  ambientGain.connect(masterGain)

  sfxGain = audioCtx.createGain()
  sfxGain.gain.value = 0.4
  sfxGain.connect(masterGain)
}

// Generate a gentle ambient pad using oscillators
function createAmbientPad() {
  ensureAudioContext()

  const notes = [110, 164.81, 220, 329.63] // A2, E3, A3, E4 — open fifths
  const types = ['sine', 'triangle', 'sine', 'sine']
  const gains = [0.08, 0.05, 0.04, 0.02]

  notes.forEach((freq, i) => {
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()

    osc.type = types[i]
    osc.frequency.value = freq

    // Gentle detune for warmth
    osc.detune.value = (Math.random() - 0.5) * 8

    gain.gain.value = gains[i]

    // Slow LFO for gentle movement
    const lfo = audioCtx.createOscillator()
    const lfoGain = audioCtx.createGain()
    lfo.type = 'sine'
    lfo.frequency.value = 0.05 + Math.random() * 0.08
    lfoGain.gain.value = freq * 0.003
    lfo.connect(lfoGain)
    lfoGain.connect(osc.frequency)
    lfo.start()

    osc.connect(gain)
    gain.connect(ambientGain)
    osc.start()

    ambientNodes.push(osc, lfo, gain, lfoGain)
  })

  // Add filtered noise for texture
  const bufferSize = audioCtx.sampleRate * 2
  const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
  const data = noiseBuffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.02
  }

  const noise = audioCtx.createBufferSource()
  noise.buffer = noiseBuffer
  noise.loop = true

  const noiseFilter = audioCtx.createBiquadFilter()
  noiseFilter.type = 'lowpass'
  noiseFilter.frequency.value = 200
  noiseFilter.Q.value = 0.5

  const noiseGain = audioCtx.createGain()
  noiseGain.gain.value = 0.15

  noise.connect(noiseFilter)
  noiseFilter.connect(noiseGain)
  noiseGain.connect(ambientGain)
  noise.start()

  ambientNodes.push(noise, noiseFilter, noiseGain)
}

// Generate a short click/tap sound buffer
function createClickSound() {
  ensureAudioContext()

  const duration = 0.08
  const sampleRate = audioCtx.sampleRate
  const buffer = audioCtx.createBuffer(1, sampleRate * duration, sampleRate)
  const data = buffer.getChannelData(0)

  for (let i = 0; i < data.length; i++) {
    const t = i / sampleRate
    const env = Math.exp(-t * 60)
    data[i] = (Math.random() * 2 - 1) * env * 0.3
  }

  return buffer
}

// Generate a gentle hover sound
function createHoverSound() {
  ensureAudioContext()

  const duration = 0.12
  const sampleRate = audioCtx.sampleRate
  const buffer = audioCtx.createBuffer(1, sampleRate * duration, sampleRate)
  const data = buffer.getChannelData(0)

  for (let i = 0; i < data.length; i++) {
    const t = i / sampleRate
    const env = Math.exp(-t * 30)
    const freq = 800 + t * 2000
    data[i] = Math.sin(2 * Math.PI * freq * t) * env * 0.06
  }

  return buffer
}

// Generate a scroll tick sound
function createScrollSound() {
  ensureAudioContext()

  const duration = 0.04
  const sampleRate = audioCtx.sampleRate
  const buffer = audioCtx.createBuffer(1, sampleRate * duration, sampleRate)
  const data = buffer.getChannelData(0)

  for (let i = 0; i < data.length; i++) {
    const t = i / sampleRate
    const env = Math.exp(-t * 100)
    data[i] = Math.sin(2 * Math.PI * 600 * t) * env * 0.03
  }

  return buffer
}

// Play a buffer-based sound through sfxGain
let clickBuffer = null
let hoverBuffer = null
let scrollBuffer = null

function playBuffer(buffer) {
  if (!audioCtx || isMuted) return
  const source = audioCtx.createBufferSource()
  source.buffer = buffer
  source.connect(sfxGain)
  source.start()
}

// Fade in master volume
function fadeIn(duration = 2) {
  if (!audioCtx || !masterGain) return
  masterGain.gain.cancelScheduledValues(audioCtx.currentTime)
  masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime)
  masterGain.gain.linearRampToValueAtTime(0.6, audioCtx.currentTime + duration)
}

// Fade out master volume
function fadeOut(duration = 1) {
  if (!audioCtx || !masterGain) return
  masterGain.gain.cancelScheduledValues(audioCtx.currentTime)
  masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime)
  masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duration)
}

// Toggle mute state
function toggleMute() {
  isMuted = !isMuted
  if (isMuted) {
    fadeOut(0.5)
  } else {
    fadeIn(1)
  }
  return isMuted
}

// Initialize audio system (call after user interaction)
export function initAudio() {
  const muteBtn = document.getElementById('muteToggle')
  if (!muteBtn) return

  // Update button state
  function updateButton() {
    muteBtn.classList.toggle('muted', isMuted)
  }

  updateButton()

  // First click: initialize audio context and start ambient
  let firstInteraction = true

  muteBtn.addEventListener('click', () => {
    if (firstInteraction) {
      ensureAudioContext()
      if (audioCtx.state === 'suspended') {
        audioCtx.resume()
      }
      createAmbientPad()
      clickBuffer = createClickSound()
      hoverBuffer = createHoverSound()
      scrollBuffer = createScrollSound()
      firstInteraction = false
      isMuted = false
      fadeIn(2)
    } else {
      toggleMute()
    }
    updateButton()
  })

  // Sound effects for interactive elements (only when unmuted)
  document.addEventListener('click', (e) => {
    if (isMuted || !clickBuffer) return
    const interactive = e.target.closest('a, button, .showcase-card, .desk-card, .note-card')
    if (interactive) {
      playBuffer(clickBuffer)
    }
  })

  // Hover sounds on cards
  const hoverTargets = document.querySelectorAll('.showcase-card, .desk-card, .note-card, .contact-link')
  hoverTargets.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      if (!isMuted && hoverBuffer) {
        playBuffer(hoverBuffer)
      }
    })
  })

  // Scroll tick sound (throttled)
  let lastScrollTick = 0
  window.addEventListener('scroll', () => {
    if (isMuted || !scrollBuffer) return
    const now = Date.now()
    if (now - lastScrollTick > 150) {
      playBuffer(scrollBuffer)
      lastScrollTick = now
    }
  }, { passive: true })

  // Keyboard shortcut: M to toggle mute
  document.addEventListener('keydown', (e) => {
    if (e.key === 'm' || e.key === 'M') {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (firstInteraction) {
        muteBtn.click()
      } else {
        toggleMute()
        updateButton()
      }
    }
  })
}
