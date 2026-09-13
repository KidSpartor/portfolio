import assert from 'node:assert/strict'
import test from 'node:test'
import { FogField } from '../src/animations/fog-field.js'

function read(field, time) {
  const pixels = new Uint8ClampedArray(field.width * field.height * 4)
  const active = field.render(time, pixels)
  const alpha = (x, y) => pixels[(y * field.width + x) * 4 + 3]
  return { pixels, active, alpha }
}

function assertClosed(result) {
  assert.equal(result.active, false)
  for (let offset = 0; offset < result.pixels.length; offset += 4) {
    assert.deepEqual([...result.pixels.subarray(offset, offset + 4)], [255, 255, 255, 0])
  }
}

test('a new field is fully fogged and writes a white, transparent removal mask', () => {
  assertClosed(read(new FogField(24, 16), 0))
})

test('a fresh wipe clears the centre with a gradual, bounded edge', () => {
  const field = new FogField(64, 64)
  field.stampSegment(32.5, 32.5, 32.5, 32.5, 12, 0.96, 100)
  const result = read(field, 100)

  assert.equal(result.active, true)
  assert.ok(result.alpha(32, 32) >= 230, 'the wipe centre should be visibly clear')
  const radial = Array.from({ length: 15 }, (_, radius) => result.alpha(32 + radius, 32))
  assert.ok(radial.every((value, index) => index === 0 || value <= radial[index - 1]))
  const transition = radial.filter(value => value > 0 && value < radial[0])
  assert.ok(new Set(transition).size >= 3, 'the brush edge must contain several partial-clear levels')
  assert.equal(radial[12], 0, 'the wipe must not extend beyond its radius')
  assert.equal(radial[14], 0)
})

test('a long pointer movement produces a continuous stroke with rounded ends', () => {
  const field = new FogField(120, 64)
  field.stampSegment(20.5, 32.5, 98.5, 32.5, 10, 1, 0)
  const result = read(field, 0)

  for (let x = 20; x <= 98; x++) {
    assert.ok(result.alpha(x, 32) >= 230, `the stroke has a gap at x=${x}`)
  }
  assert.ok(result.alpha(14, 32) > 0, 'the starting cap should extend behind the start')
  assert.ok(result.alpha(104, 32) > 0, 'the ending cap should extend beyond the end')
  assert.equal(result.alpha(10, 32), 0)
  assert.equal(result.alpha(108, 32), 0)
  assert.equal(result.alpha(12, 40), 0, 'caps must be rounded rather than rectangular')
  assert.equal(result.alpha(106, 40), 0)
})

test('a wipe holds briefly, recovers monotonically, and reaches exact zero without residue', () => {
  const field = new FogField(32, 24, { holdMs: 900, recoveryMs: 8000 })
  field.stampSegment(8.5, 12.5, 24.5, 12.5, 6, 1, 100)
  const initial = read(field, 100)
  assert.deepEqual(read(field, 1000).pixels, initial.pixels, 'the hold interval should preserve the wipe')

  let previous = initial
  for (const time of [1500, 2500, 5000, 7500, 8900, 9000]) {
    const current = read(field, time)
    for (let offset = 3; offset < current.pixels.length; offset += 4) {
      assert.ok(current.pixels[offset] <= previous.pixels[offset], `clearness increased at ${time} ms`)
    }
    previous = current
  }
  const halfway = readAtFreshField(5000)
  assert.ok(halfway.alpha(16, 12) > 0 && halfway.alpha(16, 12) < 230)
  assertClosed(read(field, 9000))
  assertClosed(read(field, 60000))

  function readAtFreshField(time) {
    const fresh = new FogField(32, 24, { holdMs: 900, recoveryMs: 8000 })
    fresh.stampSegment(8.5, 12.5, 24.5, 12.5, 6, 1, 100)
    return read(fresh, time)
  }
})

test('30, 60, and 120 Hz rendering produces the same recovery at the same wall time', () => {
  const checkpoints = [900, 2750, 4900, 7000, 8900]
  function run(fps) {
    const field = new FogField(40, 24)
    field.stampSegment(8.5, 12.5, 31.5, 12.5, 7, 0.95, 0)
    const scratch = new Uint8ClampedArray(40 * 24 * 4)
    let frame = 1
    return checkpoints.map(time => {
      while (frame * 1000 / fps < time) {
        field.render(frame * 1000 / fps, scratch)
        frame++
      }
      return read(field, time)
    })
  }

  const reference = run(60)
  for (const fps of [30, 120]) {
    const results = run(fps)
    results.forEach((result, index) => {
      assert.deepEqual(result.pixels, reference[index].pixels, `${fps} Hz differs at ${checkpoints[index]} ms`)
      assert.equal(result.active, reference[index].active)
    })
  }
})

test('repeated rendering at one timestamp neither fades nor preserves extra residue', () => {
  const field = new FogField(32, 24)
  field.stampSegment(8.5, 12.5, 24.5, 12.5, 7, 0.95, 0)
  const recovering = read(field, 6000)
  assert.ok(recovering.alpha(16, 12) > 0 && recovering.alpha(16, 12) < 200)
  for (let repetition = 0; repetition < 100; repetition++) {
    const current = read(field, 6000)
    assert.deepEqual(current.pixels, recovering.pixels)
    assert.equal(current.active, recovering.active)
  }
  assertClosed(read(field, 8900))
})

test('a later wipe elsewhere does not extend the lifetime of an old wipe', () => {
  const field = new FogField(120, 32)
  const control = new FogField(120, 32)
  for (const target of [field, control]) target.stampSegment(16.5, 16.5, 30.5, 16.5, 8, 1, 0)
  field.stampSegment(90.5, 16.5, 104.5, 16.5, 8, 1, 5000)

  for (const time of [5000, 7000, 8900]) {
    const actual = read(field, time)
    const originalOnly = read(control, time)
    for (let y = 0; y < 32; y++) {
      for (let x = 0; x < 45; x++) assert.equal(actual.alpha(x, y), originalOnly.alpha(x, y))
    }
  }
  const expired = read(field, 8900)
  assert.equal(expired.alpha(23, 16), 0)
  assert.ok(expired.alpha(97, 16) > 0, 'the newer wipe should still be recovering')
  assertClosed(read(field, 13900))
})

test('wiping a recovering patch reopens it and gives that patch a new recovery period', () => {
  const field = new FogField(40, 32)
  const wipe = time => field.stampSegment(14.5, 16.5, 26.5, 16.5, 8, 1, time)
  wipe(0)
  const faded = read(field, 7000).alpha(20, 16)
  assert.ok(faded > 0 && faded < 100)
  wipe(7000)
  assert.ok(read(field, 7000).alpha(20, 16) >= 230)
  assert.ok(read(field, 8900).alpha(20, 16) > faded, 'the patch must survive the original expiry')
  assertClosed(read(field, 15900))
})

test('reset immediately restores fog and leaves the field reusable', () => {
  const field = new FogField(40, 32)
  field.stampSegment(8.5, 8.5, 30.5, 24.5, 8, 1, 100)
  assert.equal(read(field, 100).active, true)
  field.reset()
  assertClosed(read(field, 100))
  assertClosed(read(field, 10000))
  field.stampSegment(20.5, 16.5, 20.5, 16.5, 5, 1, 11000)
  assert.ok(read(field, 11000).alpha(20, 16) >= 230)
})

test('offscreen strokes and clipped corner wipes stay inside the supplied pixel buffer', () => {
  const field = new FogField(24, 16)
  const padding = 12
  const backing = new Uint8ClampedArray(24 * 16 * 4 + padding * 2).fill(77)
  const pixels = backing.subarray(padding, backing.length - padding)
  assert.doesNotThrow(() => {
    field.stampSegment(-100, -100, -80, -80, 5, 1, 0)
    field.stampSegment(50, 40, 100, 100, 5, 1, 0)
  })
  assertClosed(read(field, 0))
  assert.doesNotThrow(() => {
    field.stampSegment(-10, -10, 0.5, 0.5, 8, 1, 0)
    field.stampSegment(23.5, 15.5, 35, 26, 8, 1, 0)
    field.stampSegment(0, 0, 20, 10, 0, 1, 0)
    field.stampSegment(0, 0, 20, 10, 8, 0, 0)
    field.render(0, pixels)
  })
  assert.ok(pixels[3] >= 230)
  assert.ok(pixels[pixels.length - 1] >= 230)
  assert.ok(backing.subarray(0, padding).every(value => value === 77))
  assert.ok(backing.subarray(backing.length - padding).every(value => value === 77))
})
