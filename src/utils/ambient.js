// London conditions are treated as material inputs, never as displayed data.
// Humidity tunes the condensation, rain changes the frequency of glass trails,
// wind shifts the refraction field, and daylight grades the view outside.

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value))

function londonDaylightFallback() {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      hour: 'numeric',
      hour12: false,
      timeZone: 'Europe/London',
    }).formatToParts(new Date())
    const hour = Number(parts.find((part) => part.type === 'hour')?.value || 12)
    return hour >= 7 && hour < 20 ? 1 : 0
  } catch {
    return 0.55
  }
}

function fallbackState() {
  return {
    humidity: 0.68,
    rain: 0.16,
    wind: 0.24,
    windDirection: 220,
    daylight: londonDaylightFallback(),
    cloud: 0.62,
    hue: 205,
    density: 0.62,
  }
}

function stateFromCurrent(current = {}) {
  const code = Number(current.weather_code || 2)
  const rainy = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)
  const foggy = [45, 48].includes(code)
  const humidity = clamp(Number(current.relative_humidity_2m || 68) / 100)
  const cloud = clamp(Number(current.cloud_cover || 62) / 100)
  const precipitation = Math.max(0, Number(current.precipitation || 0))
  const rain = clamp(precipitation * 0.38 + (rainy ? 0.28 : 0.04))
  const wind = clamp(Number(current.wind_speed_10m || 8) / 38, 0.08, 1)
  const daylight = Number(current.is_day) === 1 ? 1 : 0

  return {
    humidity,
    rain,
    wind,
    windDirection: Number(current.wind_direction_10m || 220),
    daylight,
    cloud,
    hue: rainy ? 211 : foggy ? 188 : daylight ? 38 : 218,
    density: clamp(0.36 + humidity * 0.28 + cloud * 0.12 + rain * 0.18, 0.48, 0.84),
  }
}

function applyAmbient(state) {
  const root = document.documentElement
  root.style.setProperty('--ambient-h', String(state.hue))
  root.style.setProperty('--ambient-density', state.density.toFixed(3))
  root.style.setProperty('--ambient-rain', state.rain.toFixed(3))
  root.style.setProperty('--ambient-wind', state.wind.toFixed(3))
  root.style.setProperty('--ambient-daylight', state.daylight.toFixed(3))
  root.style.setProperty('--ambient-wind-direction', `${state.windDirection}deg`)
  window.dispatchEvent(new CustomEvent('ambientchange', { detail: state }))
}

export function initAmbient() {
  applyAmbient(fallbackState())

  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 5000)
  const current = [
    'relative_humidity_2m',
    'precipitation',
    'weather_code',
    'cloud_cover',
    'wind_speed_10m',
    'wind_direction_10m',
    'is_day',
  ].join(',')
  const url = `https://api.open-meteo.com/v1/forecast?latitude=51.5074&longitude=-0.1278&current=${current}&timezone=Europe%2FLondon`

  fetch(url, { cache: 'no-store', signal: controller.signal })
    .then((response) => {
      if (!response.ok) throw new Error('Ambient request failed')
      return response.json()
    })
    .then((data) => applyAmbient(stateFromCurrent(data.current)))
    .catch(() => {})
    .finally(() => window.clearTimeout(timeout))
}
