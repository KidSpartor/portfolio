import {
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
  uniform vec2 uResolution;
  uniform vec2 uTextureSize;
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
    return (uv - 0.5) * scale + 0.5;
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

    float luminance = dot(colour, vec3(0.2126, 0.7152, 0.0722));
    colour = mix(colour, vec3(luminance), 0.035 + uRain * 0.1);

    // Daylight changes the character of the glass, not the legibility of London.
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

export function initWindowScene() {
  const hero = document.querySelector('.scene-hero')
  const canvas = document.getElementById('heroWindowScene')
  const fallback = hero?.querySelector('.hero-bg-image')
  if (!hero || !canvas || !fallback) return

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) {
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
    uResolution: { value: new Vector2(1, 1) },
    uTextureSize: { value: new Vector2(1920, 1280) },
    uPointer: { value: new Vector2(0.66, 0.44) },
    uTime: { value: 0 },
    uMotion: { value: 0 },
    uMode: { value: 0 },
    uHumidity: { value: 0.68 },
    uRain: { value: 0.2 },
    uWind: { value: 0.25 },
    uDaylight: { value: londonDaylightFallback() },
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
  let frame = 0
  let selectedMode = 0
  let targetMode = 0
  let targetPointer = new Vector2(0.66, 0.44)
  let lastPointer = new Vector2(0.66, 0.44)
  let targetMotion = 0

  function resize() {
    width = Math.max(1, hero.clientWidth)
    height = Math.max(1, hero.clientHeight)
    renderer.setSize(width, height, false)
    uniforms.uResolution.value.set(width, height)
  }

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
    uniforms.uDaylight.value = Number(detail.daylight ?? uniforms.uDaylight.value)
  })

  const themeObserver = new MutationObserver(() => {
    uniforms.uTheme.value = document.documentElement.dataset.theme === 'dark' ? 1 : 0
  })
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

  const textureUrl = `${import.meta.env.BASE_URL}images/hero/london-window.webp`
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
      canvas.classList.add('is-ready')
      fallback.classList.add('is-replaced')
    },
    undefined,
    () => hero.classList.add('window-scene-static')
  )

  const timer = new Timer()
  timer.connect(document)
  function render(time) {
    if (!active || document.hidden) {
      frame = 0
      return
    }
    timer.update(time)
    uniforms.uPointer.value.lerp(targetPointer, 0.055)
    uniforms.uMode.value += (targetMode - uniforms.uMode.value) * 0.055
    uniforms.uMotion.value += (targetMotion - uniforms.uMotion.value) * 0.14
    targetMotion *= 0.9
    uniforms.uTime.value = timer.getElapsed()
    if (textureReady) renderer.render(scene, camera)
    frame = requestAnimationFrame(render)
  }

  function start() {
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

  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(hero)
  resize()
  start()
}
