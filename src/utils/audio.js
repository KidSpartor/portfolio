// Audio system — vintage cinematic atmosphere
// Web Audio API generative ambient pad + procedural sound effects
// Inspired by the sound design of Reverse: 1999
import { Howl } from 'howler'

let audioCtx = null
let masterGain = null
let ambientGain = null
let sfxGain = null
let isMuted = true // Start muted — browser requires user interaction
let isInitialized = false
let ambientNodes = []

// Pre-generated buffers
let clickBuffer = null
let hoverBuffer = null
let scrollBuffer = null
let whooshBuffer = null

// Create AudioContext on first user interaction
function ensureAudioContext() {
  if (audioCtx) return
  audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  masterGain = audioCtx.createGain()
  masterGain.gain.value = 0
  masterGain.connect(audioCtx.destination)

  ambientGain = audioCtx.createGain()
  ambientGain.gain.value = 0.18
  ambientGain.connect(masterGain)

  sfxGain = audioCtx.createGain()
  sfxGain.gain.value = 0.35
  sfxGain.connect(masterGain)
}

// ─────────────────────────────────────────────
// Ambient Pad — D minor, warm & dark
// ─────────────────────────────────────────────
function createAmbientPad() {
  ensureAudioContext()

  // D minor chord voicing: D2, A2, D3, F3, A3
  const notes = [73.42, 110, 146.83, 174.61, 220]
  const types = ['sine', 'sine', 'triangle', 'sine', 'triangle']
  const gains = [0.06, 0.045, 0.035, 0.025, 0.018]

  notes.forEach((freq, i) => {
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()

    osc.type = types[i]
    osc.frequency.value = freq

    // Gentle detuning for warmth — spread across voices
    osc.detune.value = (Math.random() - 0.5) * 6

    gain.gain.value = gains[i]

    // Very slow LFO on pitch for organic drift
    const lfo = audioCtx.createOscillator()
    const lfoGain = audioCtx.createGain()
    lfo.type = 'sine'
    lfo.frequency.value = 0.03 + Math.random() * 0.05 // 0.03–0.08 Hz
    lfoGain.gain.value = freq * 0.002
    lfo.connect(lfoGain)
    lfoGain.connect(osc.frequency)
    lfo.start()

    osc.connect(gain)
    gain.connect(ambientGain)
    osc.start()

    ambientNodes.push(osc, lfo, gain, lfoGain)
  })

  // ── Noise layer 1: warm low rumble (lowpass 150Hz) ──
  const bufferSize = audioCtx.sampleRate * 4
  const warmNoiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
  const warmData = warmNoiseBuffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    warmData[i] = (Math.random() * 2 - 1)
  }

  const warmNoise = audioCtx.createBufferSource()
  warmNoise.buffer = warmNoiseBuffer
  warmNoise.loop = true

  const warmFilter = audioCtx.createBiquadFilter()
  warmFilter.type = 'lowpass'
  warmFilter.frequency.value = 150
  warmFilter.Q.value = 0.7

  // LFO modulating the lowpass cutoff for subtle movement
  const warmLfo = audioCtx.createOscillator()
  const warmLfoGain = audioCtx.createGain()
  warmLfo.type = 'sine'
  warmLfo.frequency.value = 0.04
  warmLfoGain.gain.value = 30
  warmLfo.connect(warmLfoGain)
  warmLfoGain.connect(warmFilter.frequency)
  warmLfo.start()

  const warmNoiseGain = audioCtx.createGain()
  warmNoiseGain.gain.value = 0.1

  warmNoise.connect(warmFilter)
  warmFilter.connect(warmNoiseGain)
  warmNoiseGain.connect(ambientGain)
  warmNoise.start()

  ambientNodes.push(warmNoise, warmFilter, warmNoiseGain, warmLfo, warmLfoGain)

  // ── Noise layer 2: "air" band (bandpass 400Hz) ──
  const airNoiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
  const airData = airNoiseBuffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    airData[i] = (Math.random() * 2 - 1)
  }

  const airNoise = audioCtx.createBufferSource()
  airNoise.buffer = airNoiseBuffer
  airNoise.loop = true

  const airFilter = audioCtx.createBiquadFilter()
  airFilter.type = 'bandpass'
  airFilter.frequency.value = 400
  airFilter.Q.value = 1.2

  // Slow LFO on the air filter
  const airLfo = audioCtx.createOscillator()
  const airLfoGain = audioCtx.createGain()
  airLfo.type = 'sine'
  airLfo.frequency.value = 0.06
  airLfoGain.gain.value = 80
  airLfo.connect(airLfoGain)
  airLfoGain.connect(airFilter.frequency)
  airLfo.start()

  const airNoiseGain = audioCtx.createGain()
  airNoiseGain.gain.value = 0.04

  airNoise.connect(airFilter)
  airFilter.connect(airNoiseGain)
  airNoiseGain.connect(ambientGain)
  airNoise.start()

  ambientNodes.push(airNoise, airFilter, airNoiseGain, airLfo, airLfoGain)
}

// ─────────────────────────────────────────────
// Sound effect generators (offline buffer synthesis)
// ─────────────────────────────────────────────

// Click: warm brass mechanism — sine burst at 1200Hz + filtered noise
function createClickSound() {
  ensureAudioContext()

  const duration = 0.06
  const sr = audioCtx.sampleRate
  const len = Math.floor(sr * duration)
  const buffer = audioCtx.createBuffer(1, len, sr)
  const data = buffer.getChannelData(0)

  for (let i = 0; i < len; i++) {
    const t = i / sr
    // Sharp exponential envelope
    const env = Math.exp(-t * 70)
    // Sine component — the tonal "click"
    const sine = Math.sin(2 * Math.PI * 1200 * t)
    // Noise component — the mechanical transient
    const noise = Math.random() * 2 - 1
    // Mix: sine dominates early, noise fills the tail
    const mix = sine * 0.55 + noise * 0.45
    data[i] = mix * env * 0.22
  }

  return buffer
}

// Hover: soft breath / page-turn — filtered noise with bandpass
function createHoverSound() {
  ensureAudioContext()

  const duration = 0.15
  const sr = audioCtx.sampleRate
  const len = Math.floor(sr * duration)
  const buffer = audioCtx.createBuffer(1, len, sr)
  const data = buffer.getChannelData(0)

  // We synthesize the bandpass effect directly in the buffer
  // by mixing noise through a simple resonant filter simulation
  const centerFreq = 2000
  const q = 2.0
  const bandwidth = centerFreq / q
  const lowCut = centerFreq - bandwidth * 0.5
  const highCut = centerFreq + bandwidth * 0.5

  // Simple IIR-style approach: generate shaped noise
  let prev = 0
  for (let i = 0; i < len; i++) {
    const t = i / sr
    // Soft attack, gentle decay envelope
    const env = Math.min(t / 0.01, 1) * Math.exp(-t * 14)
    const raw = Math.random() * 2 - 1
    // One-pole highpass + lowpass approximation for bandpass character
    const hpAlpha = Math.min(1, 2 * Math.PI * lowCut / sr)
    const lpAlpha = Math.min(1, 2 * Math.PI * highCut / sr)
    const hp = raw - prev * (1 - hpAlpha)
    prev = hp
    const shaped = hp * lpAlpha + (1 - lpAlpha) * 0
    data[i] = shaped * env * 0.04
  }

  return buffer
}

// Scroll tick: old clock mechanism — short sine at 800Hz
function createScrollSound() {
  ensureAudioContext()

  const duration = 0.035
  const sr = audioCtx.sampleRate
  const len = Math.floor(sr * duration)
  const buffer = audioCtx.createBuffer(1, len, sr)
  const data = buffer.getChannelData(0)

  for (let i = 0; i < len; i++) {
    const t = i / sr
    const env = Math.exp(-t * 120)
    data[i] = Math.sin(2 * Math.PI * 800 * t) * env * 0.018
  }

  return buffer
}

// Section transition whoosh: noise sweep 400Hz → 1200Hz with reverb tail
function createWhooshSound() {
  ensureAudioContext()

  const duration = 0.6
  const sr = audioCtx.sampleRate
  const len = Math.floor(sr * duration)
  const buffer = audioCtx.createBuffer(1, len, sr)
  const data = buffer.getChannelData(0)

  // Pre-generate a long noise source for the sweep
  const noiseLen = len + Math.floor(sr * 0.3) // extra for reverb tail
  const noiseSource = new Float32Array(noiseLen)
  for (let i = 0; i < noiseLen; i++) {
    noiseSource[i] = Math.random() * 2 - 1
  }

  // Simple delay-line reverb simulation
  const delaySamples = Math.floor(sr * 0.04)
  const decay = 0.6

  for (let i = 0; i < len; i++) {
    const t = i / sr
    // Envelope: soft attack, sustained body, soft release
    const attackEnv = Math.min(t / 0.08, 1)
    const releaseEnv = t < 0.35 ? 1 : Math.max(0, 1 - (t - 0.35) / 0.25)
    const env = attackEnv * releaseEnv

    // Frequency sweep from 400 to 1200 Hz (exponential feels more natural)
    const sweepFreq = 400 * Math.pow(1200 / 400, t / 0.4)
    // Resonance simulation: modulate noise by a sine at the sweep frequency
    const sweepTone = Math.sin(2 * Math.PI * sweepFreq * t)

    // Mix: modulated noise gives the "whoosh" character
    const raw = noiseSource[i] * 0.5 + sweepTone * 0.5

    // Simple reverb tail: delayed copies with decay
    let reverb = 0
    for (let d = 1; d <= 4; d++) {
      const idx = i - delaySamples * d
      if (idx >= 0 && idx < noiseLen) {
        reverb += noiseSource[idx] * Math.pow(decay, d)
      }
    }

    data[i] = (raw * 0.6 + reverb * 0.15) * env * 0.12
  }

  return buffer
}

// ─────────────────────────────────────────────
// Playback
// ─────────────────────────────────────────────
function playBuffer(buffer) {
  if (!audioCtx || isMuted) return
  const source = audioCtx.createBufferSource()
  source.buffer = buffer
  source.connect(sfxGain)
  source.start()
}

// Play the whoosh through sfxGain with slightly more presence
function playWhoosh() {
  if (!audioCtx || isMuted || !whooshBuffer) return
  const source = audioCtx.createBufferSource()
  source.buffer = whooshBuffer
  source.connect(sfxGain)
  source.start()
}

// ─────────────────────────────────────────────
// Fade helpers
// ─────────────────────────────────────────────
function fadeIn(duration = 1.5) {
  if (!audioCtx || !masterGain) return
  masterGain.gain.cancelScheduledValues(audioCtx.currentTime)
  masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime)
  masterGain.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + duration)
}

function fadeOut(duration = 1.5) {
  if (!audioCtx || !masterGain) return
  masterGain.gain.cancelScheduledValues(audioCtx.currentTime)
  masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime)
  masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duration)
}

// Toggle mute state
function toggleMute() {
  isMuted = !isMuted
  if (isMuted) {
    fadeOut(1.5)
  } else {
    fadeIn(1.5)
  }
  return isMuted
}

// ─────────────────────────────────────────────
// Section-reveal observer (whoosh on entering viewport)
// ─────────────────────────────────────────────
function observeSections() {
  const sections = document.querySelectorAll('section, .section-reveal')
  if (!sections.length) return

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !isMuted) {
          playWhoosh()
        }
      })
    },
    { threshold: 0.15 }
  )

  sections.forEach((section) => observer.observe(section))
}

// ─────────────────────────────────────────────
// Initialization
// ─────────────────────────────────────────────
export function initAudio() {
  const muteBtn = document.getElementById('muteToggle')
  if (!muteBtn) return

  // Update button visual state
  function updateButton() {
    muteBtn.classList.toggle('muted', isMuted)
  }

  updateButton()

  // First click: create AudioContext, build ambient pad, generate buffers
  let firstInteraction = true

  function bootAudioSystem() {
    if (!firstInteraction) return
    firstInteraction = false

    ensureAudioContext()
    if (audioCtx.state === 'suspended') {
      audioCtx.resume()
    }

    createAmbientPad()

    // Generate all effect buffers
    clickBuffer = createClickSound()
    hoverBuffer = createHoverSound()
    scrollBuffer = createScrollSound()
    whooshBuffer = createWhooshSound()

    // Start unmuted
    isMuted = false
    fadeIn(1.5)

    // Begin observing sections for transition whoosh
    observeSections()
  }

  // Mute button click handler
  muteBtn.addEventListener('click', () => {
    if (firstInteraction) {
      bootAudioSystem()
    } else {
      toggleMute()
    }
    updateButton()
  })

  // ── Click sounds on interactive elements ──
  document.addEventListener('click', (e) => {
    if (isMuted || !clickBuffer) return
    const interactive = e.target.closest(
      'a, button, .showcase-card, .desk-card, .note-card'
    )
    if (interactive) {
      playBuffer(clickBuffer)
    }
  })

  // ── Hover sounds on cards and links ──
  const hoverTargets = document.querySelectorAll(
    '.showcase-card, .desk-card, .note-card, .contact-link'
  )
  hoverTargets.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      if (!isMuted && hoverBuffer) {
        playBuffer(hoverBuffer)
      }
    })
  })

  // ── Scroll tick (throttled to every 200ms) ──
  let lastScrollTick = 0
  window.addEventListener(
    'scroll',
    () => {
      if (isMuted || !scrollBuffer) return
      const now = Date.now()
      if (now - lastScrollTick > 200) {
        playBuffer(scrollBuffer)
        lastScrollTick = now
      }
    },
    { passive: true }
  )

  // ── Keyboard shortcut: M to toggle mute ──
  document.addEventListener('keydown', (e) => {
    if (e.key === 'm' || e.key === 'M') {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (firstInteraction) {
        bootAudioSystem()
      } else {
        toggleMute()
      }
      updateButton()
    }
  })
}
