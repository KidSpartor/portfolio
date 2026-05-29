// Audio system — simple HTML5 background music
// Uses a single <audio> element, no Web Audio API, no sound effects

let audio = null
let isMuted = true

function createAudioElement() {
  audio = new Audio('/bgm.mp3')
  audio.loop = true
  audio.volume = 0
  audio.muted = true
  // Muted by default — don't pull the 5MB track until the user opts in.
  audio.preload = 'none'
  document.body.appendChild(audio)
}

function fadeIn(duration = 1) {
  if (!audio) return
  audio.muted = false
  const target = 0.3
  const step = target / (duration * 20) // 50ms intervals
  let vol = audio.volume
  const id = setInterval(() => {
    vol = Math.min(vol + step, target)
    audio.volume = vol
    if (vol >= target) clearInterval(id)
  }, 50)
}

function fadeOut(duration = 1) {
  if (!audio) return
  const start = audio.volume
  const step = start / (duration * 20)
  let vol = start
  const id = setInterval(() => {
    vol = Math.max(vol - step, 0)
    audio.volume = vol
    if (vol <= 0) {
      clearInterval(id)
      audio.muted = true
    }
  }, 50)
}

function toggleMute() {
  isMuted = !isMuted
  if (isMuted) {
    fadeOut(1)
  } else {
    audio.play().catch(() => {})
    fadeIn(1)
  }
  return isMuted
}

function updateButton(btn) {
  if (!btn) return
  btn.classList.toggle('muted', isMuted)
}

export function initAudio() {
  const muteBtn = document.getElementById('muteToggle')
  if (!muteBtn) return

  createAudioElement()
  updateButton(muteBtn)

  // Toggle on button click
  muteBtn.addEventListener('click', () => {
    toggleMute()
    updateButton(muteBtn)
  })

  // Keyboard shortcut: M to toggle mute
  document.addEventListener('keydown', (e) => {
    if (e.key === 'm' || e.key === 'M') {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      toggleMute()
      updateButton(muteBtn)
    }
  })
}
