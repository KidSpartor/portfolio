// Store each patch's last wipe in time, not in repeatedly rounded canvas alpha.
export class FogField {
  constructor(width, height, { holdMs = 900, recoveryMs = 8000 } = {}) {
    this.width = width
    this.height = height
    this.holdMs = holdMs
    this.recoveryMs = recoveryMs
    this.strength = new Float32Array(width * height)
    this.markedAt = new Float64Array(width * height)
  }

  amountAt(index, time) {
    const age = Math.max(0, time - this.markedAt[index] - this.holdMs)
    const progress = Math.min(1, age / this.recoveryMs)
    return this.strength[index] * (1 - progress * progress * (3 - 2 * progress))
  }

  stampSegment(x0, y0, x1, y1, radius, strength, time) {
    if (radius <= 0 || strength <= 0) return
    const left = Math.max(0, Math.floor(Math.min(x0, x1) - radius))
    const right = Math.min(this.width - 1, Math.ceil(Math.max(x0, x1) + radius))
    const top = Math.max(0, Math.floor(Math.min(y0, y1) - radius))
    const bottom = Math.min(this.height - 1, Math.ceil(Math.max(y0, y1) + radius))
    const dx = x1 - x0
    const dy = y1 - y0
    const lengthSquared = dx * dx + dy * dy

    for (let y = top; y <= bottom; y++) {
      for (let x = left; x <= right; x++) {
        const along = lengthSquared
          ? Math.max(0, Math.min(1, ((x + 0.5 - x0) * dx + (y + 0.5 - y0) * dy) / lengthSquared))
          : 0
        const distance = Math.hypot(x + 0.5 - x0 - along * dx, y + 0.5 - y0 - along * dy)
        if (distance >= radius) continue
        const edge = Math.max(0, (distance / radius - 0.48) / 0.52)
        const brush = Math.min(1, strength) * (1 - edge * edge * (3 - 2 * edge))
        const index = y * this.width + x
        this.strength[index] = Math.max(this.amountAt(index, time), brush)
        this.markedAt[index] = time
      }
    }
  }

  render(time, pixels) {
    let active = false
    for (let index = 0; index < this.strength.length; index++) {
      const amount = this.strength[index] ? this.amountAt(index, time) : 0
      if (amount === 0) this.strength[index] = 0
      else active = true
      const offset = index * 4
      pixels[offset] = pixels[offset + 1] = pixels[offset + 2] = 255
      pixels[offset + 3] = Math.round(amount * 255)
    }
    return active
  }

  reset() {
    this.strength.fill(0)
    this.markedAt.fill(0)
  }
}
