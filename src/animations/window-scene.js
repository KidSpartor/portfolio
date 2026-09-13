import {
  CanvasTexture,
  LinearFilter,
  MathUtils,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  TextureLoader,
  Timer,
  Vector2,
  WebGLRenderer,
} from 'three'

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform sampler2D uBlurredTexture;
  uniform sampler2D uGlassMask;
  uniform float uGlassEnabled;
  uniform vec2 uResolution;
  uniform vec2 uTextureSize;
  uniform vec2 uImagePosition;
  uniform vec2 uPointer;
  uniform float uTime;
  uniform float uMotion;
  uniform float uMode;
  uniform float uHumidity;
  uniform float uRain;
  uniform float uWind;
  uniform float uDaylight;
  uniform float uTheme;

  varying vec2 vUv;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  vec2 coverUv(vec2 uv) {
    float screenAspect = uResolution.x / max(uResolution.y, 1.0);
    float imageAspect = uTextureSize.x / max(uTextureSize.y, 1.0);
    vec2 scale = screenAspect > imageAspect
      ? vec2(1.0, imageAspect / screenAspect)
      : vec2(screenAspect / imageAspect, 1.0);
    return uv * scale + (1.0 - scale) * uImagePosition;
  }

  void main() {
    vec2 uv = vUv;
    vec2 glassField = uv * vec2(5.4, 3.6);
    float drift = uTime * (0.002 + uWind * 0.006);
    float coarse = noise(glassField + vec2(drift, -drift * 0.35));
    float fine = noise(glassField * 3.1 + vec2(-drift * 0.7, drift));
    vec2 glassOffset = vec2(coarse - 0.5, fine - 0.5) * (0.004 + uHumidity * 0.0045);

    float systemsMode = max(0.0, 1.0 - abs(uMode - 1.0));
    float experimentsMode = smoothstep(1.2, 2.0, uMode);
    float systemsFold = sin((uv.y + uTime * 0.004) * 24.0 + coarse * 2.4);
    glassOffset.x += systemsFold * systemsMode * 0.0028;
    vec2 experimentField = vec2(
      noise(glassField * 1.8 + vec2(uTime * 0.012, 7.1)),
      noise(glassField * 2.2 + vec2(4.8, -uTime * 0.01))
    ) - 0.5;
    glassOffset += experimentField * experimentsMode * 0.0045;

    vec2 pointerDelta = uv - uPointer;
    float pointerDistance = dot(pointerDelta, pointerDelta);
    float lens = exp(-pointerDistance * 17.0);
    vec2 pointerDirection = normalize(pointerDelta + vec2(0.0001));
    glassOffset += pointerDirection * lens * (0.0012 + uMotion * 0.0065);

    vec2 modeOffset = mix(vec2(0.0), vec2(-0.012, 0.005), smoothstep(0.0, 1.0, uMode));
    modeOffset = mix(modeOffset, vec2(0.009, -0.005), smoothstep(1.0, 2.0, uMode));
    vec2 parallax = (uPointer - 0.5) * vec2(0.012, 0.007);
    vec2 sampleUv = coverUv(uv + glassOffset + parallax + modeOffset);

    float split = 0.00035 + uMotion * 0.0014 + experimentsMode * 0.0007;
    vec3 colour;
    colour.r = texture2D(uTexture, sampleUv + vec2(split, 0.0)).r;
    colour.g = texture2D(uTexture, sampleUv).g;
    colour.b = texture2D(uTexture, sampleUv - vec2(split, 0.0)).b;

    // The wipe belongs to the pane, so it must stay in screen space while the
    // city moves behind it. Its alpha is also used by the visible mist canvas.
    if (uGlassEnabled > 0.5) {
      float clearing = texture2D(uGlassMask, uv).a;
      vec3 foggedColour = texture2D(uBlurredTexture, sampleUv).rgb;
      colour = mix(foggedColour, colour, clearing);
    }

    float luminance = dot(colour, vec3(0.2126, 0.7152, 0.0722));
    colour = mix(colour, vec3(luminance), 0.035 + uRain * 0.1);

    // Keep the photograph's night lighting even when live London weather is daytime.
    vec3 blueHour = vec3(0.79, 0.86, 0.94);
    vec3 dayTint = vec3(1.04, 1.0, 0.94);
    colour *= mix(blueHour, dayTint, 0.22 + uDaylight * 0.78);
    colour += (1.0 - uDaylight) * vec3(0.032, 0.043, 0.062);

    float cityLight = smoothstep(0.56, 0.88, luminance) * (1.0 - uDaylight);
    colour += cityLight * vec3(0.09, 0.055, 0.018);
    colour = mix(colour, colour * vec3(0.94, 0.91, 0.82), uTheme * 0.18);
    colour = pow(max(colour, 0.0), vec3(0.86));

    float paneShade = smoothstep(0.0, 0.7, abs(uv.x - 0.5)) * 0.055;
    float edgeShade = smoothstep(0.38, 0.72, length((uv - 0.5) * vec2(0.84, 1.0)));
    colour *= 1.0 - paneShade - edgeShade * 0.1;

    float grain = hash(gl_FragCoord.xy + vec2(uTime * 0.05)) - 0.5;
    colour += grain * 0.012;

    gl_FragColor = vec4(colour, 1.0);
    #include <colorspace_fragment>
  }
`

function makeBlurredTexture(image, width, height) {
  if (width < 2 || height < 2) return null
  const sourceWidth = image.naturalWidth || image.width
  const sourceHeight = image.naturalHeight || image.height
  const scale = Math.min(1, 1536 / Math.max(sourceWidth, sourceHeight))
  const textureWidth = Math.max(1, Math.round(sourceWidth * scale))
  const textureHeight = Math.max(1, Math.round(sourceHeight * scale))
  const coverScale = Math.max(width / sourceWidth, height / sourceHeight)
  const blur = 6.5 * scale / coverScale
  const padding = Math.ceil(blur * 3)
  const padded = document.createElement('canvas')
  padded.width = textureWidth + padding * 2
  padded.height = textureHeight + padding * 2
  const source = padded.getContext('2d')
  const blurred = document.createElement('canvas')
  blurred.width = textureWidth
  blurred.height = textureHeight
  const context = blurred.getContext('2d')
  if (!source || !context || !('filter' in context)) return null

  // Extend the photograph's edges before blurring so transparent borders never
  // produce a dark fringe. This work happens on load/resize, never per frame.
  source.drawImage(image, padding, padding, textureWidth, textureHeight)
  source.drawImage(image, 0, 0, 1, sourceHeight, 0, padding, padding, textureHeight)
  source.drawImage(image, sourceWidth - 1, 0, 1, sourceHeight, padding + textureWidth, padding, padding, textureHeight)
  source.drawImage(padded, 0, padding, padded.width, 1, 0, 0, padded.width, padding)
  source.drawImage(padded, 0, padding + textureHeight - 1, padded.width, 1, 0, padding + textureHeight, padded.width, padding)
  context.filter = `blur(${blur}px)`
  context.drawImage(padded, -padding, -padding)

  const texture = new CanvasTexture(blurred)
  texture.colorSpace = SRGBColorSpace
  texture.minFilter = LinearFilter
  texture.magFilter = LinearFilter
  texture.generateMipmaps = false
  return texture
}

export function initWindowScene() {
  const hero = document.querySelector('.scene-hero')
  const canvas = document.getElementById('heroWindowScene')
  const fallback = hero?.querySelector('.hero-bg-image')
  if (!hero || !canvas || !fallback) return

  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
  if (motionPreference.matches) {
    hero.classList.add('window-scene-static')
    return
  }

  let renderer
  try {
    renderer = new WebGLRenderer({
      canvas,
      alpha: false,
      antialias: false,
      powerPreference: 'high-performance',
    })
  } catch {
    hero.classList.add('window-scene-static')
    return
  }

  renderer.outputColorSpace = SRGBColorSpace
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 700 ? 1.2 : 1.5))

  const scene = new Scene()
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1)
  const uniforms = {
    uTexture: { value: null },
    uBlurredTexture: { value: null },
    uGlassMask: { value: null },
    uGlassEnabled: { value: 0 },
    uResolution: { value: new Vector2(1, 1) },
    uTextureSize: { value: new Vector2(1920, 1280) },
    uImagePosition: { value: new Vector2(0.5, 0.5) },
    uPointer: { value: new Vector2(0.66, 0.44) },
    uTime: { value: 0 },
    uMotion: { value: 0 },
    uMode: { value: 0 },
    uHumidity: { value: 0.68 },
    uRain: { value: 0.2 },
    uWind: { value: 0.25 },
    uDaylight: { value: 0 },
    uTheme: { value: document.documentElement.dataset.theme === 'dark' ? 1 : 0 },
  }

  const material = new ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    depthTest: false,
    depthWrite: false,
  })
  const geometry = new PlaneGeometry(2, 2)
  const plane = new Mesh(geometry, material)
  scene.add(plane)

  let width = 1
  let height = 1
  let active = true
  let textureReady = false
  let contextLost = false
  let maskWidth = 0
  let maskHeight = 0
  let canvasVisible = false
  let revealTimer = 0
  let frame = 0
  let selectedMode = 0
  let targetMode = 0
  let targetPointer = new Vector2(0.66, 0.44)
  let lastPointer = new Vector2(0.66, 0.44)
  let targetMotion = 0

  function resize() {
    const nextWidth = Math.max(1, hero.clientWidth)
    const nextHeight = Math.max(1, hero.clientHeight)
    const sizeChanged = width !== nextWidth || height !== nextHeight
    width = nextWidth
    height = nextHeight
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, width < 700 ? 1.2 : 1.5))
    renderer.setSize(width, height, false)
    uniforms.uResolution.value.set(width, height)
    // Match the photograph's responsive CSS crop; texture Y runs bottom to top.
    const [positionX, positionY] = getComputedStyle(fallback).objectPosition
      .split(/\s+/).map((value) => parseFloat(value) / 100)
    uniforms.uImagePosition.value.set(positionX, 1 - positionY)
    if (sizeChanged && textureReady) refreshBlurredTexture()
  }

  function refreshBlurredTexture() {
    let texture = null
    try {
      texture = makeBlurredTexture(uniforms.uTexture.value.image, width, height)
    } catch {
      // The CSS frost remains available when this browser cannot preblur.
    }
    uniforms.uBlurredTexture.value?.dispose()
    uniforms.uBlurredTexture.value = texture
    if (!texture) hero.classList.remove('window-glass-ready')
  }

  function updateGlassMask(maskCanvas) {
    if (!(maskCanvas instanceof HTMLCanvasElement) || !maskCanvas.width || !maskCanvas.height) {
      uniforms.uGlassMask.value?.dispose()
      uniforms.uGlassMask.value = null
      hero.classList.remove('window-glass-ready')
      return
    }
    const current = uniforms.uGlassMask.value
    if (current?.image !== maskCanvas || maskWidth !== maskCanvas.width || maskHeight !== maskCanvas.height) {
      current?.dispose()
      const texture = new CanvasTexture(maskCanvas)
      texture.minFilter = LinearFilter
      texture.magFilter = LinearFilter
      texture.generateMipmaps = false
      uniforms.uGlassMask.value = texture
      maskWidth = maskCanvas.width
      maskHeight = maskCanvas.height
    } else {
      current.needsUpdate = true
    }
  }

  updateGlassMask(document.getElementById('heroFog')?.glassMask)
  window.addEventListener('glassmaskchange', (event) => updateGlassMask(event.detail?.canvas))

  function setMode(mode) {
    targetMode = Number.isFinite(mode) ? Math.max(0, Math.min(2, mode)) : 0
  }

  const modeButtons = [...hero.querySelectorAll('[data-window-mode]')]
  modeButtons.forEach((button) => {
    const mode = Number(button.dataset.windowMode || 0)
    button.addEventListener('pointerenter', () => setMode(mode))
    button.addEventListener('focus', () => setMode(mode))
    button.addEventListener('pointerleave', () => setMode(selectedMode))
    button.addEventListener('click', () => {
      selectedMode = mode
      setMode(mode)
      modeButtons.forEach((item) => {
        const selected = item === button
        item.classList.toggle('is-active', selected)
        item.setAttribute('aria-pressed', String(selected))
      })
    })
  })

  hero.addEventListener('pointermove', (event) => {
    const rect = hero.getBoundingClientRect()
    const x = MathUtils.clamp((event.clientX - rect.left) / rect.width, 0, 1)
    const y = MathUtils.clamp(1 - (event.clientY - rect.top) / rect.height, 0, 1)
    targetPointer.set(x, y)
    targetMotion = Math.min(1, lastPointer.distanceTo(targetPointer) * 8)
    lastPointer.copy(targetPointer)
  }, { passive: true })

  window.addEventListener('ambientchange', (event) => {
    const detail = event.detail || {}
    uniforms.uHumidity.value = Number(detail.humidity ?? uniforms.uHumidity.value)
    uniforms.uRain.value = Number(detail.rain ?? uniforms.uRain.value)
    uniforms.uWind.value = Number(detail.wind ?? uniforms.uWind.value)
  })

  const themeObserver = new MutationObserver(() => {
    uniforms.uTheme.value = document.documentElement.dataset.theme === 'dark' ? 1 : 0
  })
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

  const textureUrl = fallback.currentSrc || fallback.src
  new TextureLoader().load(
    textureUrl,
    (texture) => {
      texture.colorSpace = SRGBColorSpace
      texture.minFilter = LinearFilter
      texture.magFilter = LinearFilter
      uniforms.uTexture.value = texture
      uniforms.uTextureSize.value.set(texture.image.naturalWidth || texture.image.width, texture.image.naturalHeight || texture.image.height)
      renderer.initTexture(texture)
      textureReady = true
      refreshBlurredTexture()
    },
    undefined,
    () => hero.classList.add('window-scene-static')
  )

  const timer = new Timer()
  timer.connect(document)

  function revealCanvas() {
    if (canvas.classList.contains('is-ready')) return
    canvas.classList.add('is-ready')
    fallback.classList.add('is-replaced')
    const style = getComputedStyle(canvas)
    const milliseconds = (value) => parseFloat(value) * (value.trim().endsWith('ms') ? 1 : 1000)
    const durations = style.transitionDuration.split(',').map(milliseconds)
    const delays = style.transitionDelay.split(',').map(milliseconds)
    const duration = Math.max(0, ...durations.map((value, index) => value + delays[index % delays.length]))
    // Keep the CSS frost until the WebGL canvas is opaque. The next rendered
    // frame then switches both background blur and frost ownership together.
    revealTimer = window.setTimeout(() => {
      revealTimer = 0
      canvasVisible = true
    }, duration)
  }

  function restoreFallback() {
    window.clearTimeout(revealTimer)
    revealTimer = 0
    canvasVisible = false
    hero.classList.remove('window-glass-ready')
    canvas.classList.remove('is-ready')
    fallback.classList.remove('is-replaced')
  }

  function render(time) {
    if (!active || document.hidden || contextLost || motionPreference.matches) {
      frame = 0
      return
    }
    timer.update(time)
    uniforms.uPointer.value.lerp(targetPointer, 0.055)
    uniforms.uMode.value += (targetMode - uniforms.uMode.value) * 0.055
    uniforms.uMotion.value += (targetMotion - uniforms.uMotion.value) * 0.14
    targetMotion *= 0.9
    uniforms.uTime.value = timer.getElapsed()
    if (textureReady) {
      const glassReady = canvasVisible && !!uniforms.uBlurredTexture.value && !!uniforms.uGlassMask.value
      uniforms.uGlassEnabled.value = glassReady ? 1 : 0
      renderer.render(scene, camera)
      revealCanvas()
      hero.classList.toggle('window-glass-ready', glassReady)
    }
    frame = requestAnimationFrame(render)
  }

  function start() {
    if (contextLost || motionPreference.matches) return
    active = true
    if (!frame) {
      timer.reset()
      frame = requestAnimationFrame(render)
    }
  }

  function stop() {
    active = false
    if (frame) cancelAnimationFrame(frame)
    frame = 0
  }

  const observer = new IntersectionObserver((entries) => {
    entries[0]?.isIntersecting ? start() : stop()
  }, { threshold: 0.03 })
  observer.observe(hero)

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop()
    else if (hero.getBoundingClientRect().bottom > 0) start()
  })

  motionPreference.addEventListener('change', () => {
    if (motionPreference.matches) {
      stop()
      restoreFallback()
    } else if (!document.hidden && hero.getBoundingClientRect().bottom > 0) {
      start()
    }
  })

  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault()
    contextLost = true
    stop()
    restoreFallback()
    hero.classList.add('window-scene-static')
  })

  canvas.addEventListener('webglcontextrestored', () => {
    contextLost = false
    for (const name of ['uTexture', 'uBlurredTexture', 'uGlassMask']) {
      if (uniforms[name].value) uniforms[name].value.needsUpdate = true
    }
    hero.classList.remove('window-scene-static')
    resize()
    if (!document.hidden && hero.getBoundingClientRect().bottom > 0) start()
  })

  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(hero)
  window.addEventListener('resize', resize, { passive: true })
  resize()
  start()
}
