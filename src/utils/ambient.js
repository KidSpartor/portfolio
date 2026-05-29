// Ambient system — weather and time-driven visual tuning
// Preserves the original site's environmental responsiveness

export function initAmbient() {
  const root = document.documentElement
  const ambient = {
    hue: 38,
    saturation: '60%',
    light: '50%',
    density: 0.5,
  }

  function applyAmbient() {
    // We don't set CSS variables for the new design,
    // but we keep the system running for potential future use
    // and for the canvas effects to read
    root.style.setProperty('--ambient-h', ambient.hue)
    root.style.setProperty('--ambient-density', ambient.density.toFixed(2))
  }

  function paletteFor(code, temp, wind) {
    const rainy = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(code)
    const clear = [0, 1].includes(code)
    const foggy = [45, 48].includes(code)

    let hue = clear ? 38 : rainy ? 210 : foggy ? 168 : 38
    if (temp >= 24) hue = 28
    if (temp <= 3) hue = 200

    return {
      hue,
      saturation: clear ? '70%' : rainy ? '45%' : '55%',
      light: clear ? '52%' : rainy ? '40%' : '48%',
      density: Math.max(0.2, Math.min(0.9, wind / 22 + (rainy ? 0.2 : 0.05))),
    }
  }

  async function tuneFromEnvironment(lat = 48.8566, lon = 2.3522) {
    try {
      const url = `https://wttr.in/${lat.toFixed(4)},${lon.toFixed(4)}?format=j1`
      const res = await fetch(url, { cache: 'no-store' })
      const data = await res.json()
      const current = data.current_condition?.[0] || {}
      Object.assign(
        ambient,
        paletteFor(
          Number(current.weatherCode || 2),
          Number(current.temp_C || 12),
          Number(current.windspeedKmph || 8)
        )
      )
    } catch {
      Object.assign(ambient, paletteFor(2, 12, 8))
    }
    applyAmbient()
  }

  // Tune from London weather (the site's spiritual home) without prompting for
  // geolocation — the permission popup on first load isn't worth it.
  tuneFromEnvironment(51.5074, -0.1278)
}
