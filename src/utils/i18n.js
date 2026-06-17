// Bilingual content (中文 / English) for the studio site.
// Applied to [data-i18n] elements before any text-splitting animation runs,
// so the hero character reveal sees the correct language.
// Keys ending in ":html" carry markup (e.g. <em>, <br>) and are set via innerHTML.

const DICT = {
  en: {
    'nav.work': 'Work',
    'nav.story': 'Story',
    'nav.desk': 'Desk',
    'nav.notes': 'Notes',
    'nav.contact': 'Contact',

    'hero.eyebrow': 'Studio index — 2026',
    'hero.title1': 'Kid Spartor',
    'hero.title2': 'keeps useful things',
    'hero.title3:html': '<em>slightly strange.</em>',
    'hero.subtitle': 'Software, systems, instruments, prototypes — and the interface details that make an idea feel alive without ever announcing the trick.',
    'hero.s1': 'Build interfaces that reward repeated use, not just the first impression.',
    'hero.s2': 'Turn rough ideas into working objects before they become too precious to touch.',
    'hero.s3': 'Let the system show its intelligence through behaviour, restraint, and rhythm.',
    'hero.scroll': 'Scroll to enter',

    'work.label': 'Selected directions',
    'work.title': 'A portfolio can be a cabinet, not a trophy shelf.',
    'work.desc': 'Four things I actually built and shipped: an interactive course, a full-stack card table, a desktop player, and a little game about gravity.',
    'work.role': 'Role',
    'work.detail': 'Key detail',
    'work.status': 'Status',
    'work.c1.title': 'Zero to UNet',
    'work.c1.body': 'A browser-native deep learning course — from a single perceptron to UNet segmentation. 11 chapters of Canvas-driven demos: gradient-descent heatmaps, sliding convolutions, live skip connections. Zero dependencies, progress saved locally.',
    'work.c1.role': 'Course author + interaction designer',
    'work.c1.detail': 'Canvas demos for gradients, CNNs, and UNet skip paths',
    'work.c1.status': 'Published inside this site',
    'work.c1.t1': 'Deep Learning',
    'work.c1.t2': 'Canvas / KaTeX',
    'work.c1.t3': 'Interactive course',
    'work.c2.title': "Texas Hold'em",
    'work.c2.body': "A full-stack Texas Hold'em table built as a monorepo: shared game engine, a web client, and a React Native mobile build. Deployed live on Vercel, with an Android .apk on the side.",
    'work.c2.role': 'Game engine + web/mobile client',
    'work.c2.detail': 'Shared rules engine across Vercel web and React Native',
    'work.c2.status': 'Live demo available',
    'work.c2.t1': 'Full-stack',
    'work.c2.t2': 'React Native',
    'work.c2.t3': 'Live demo',
    'work.c3.title': 'Music Player',
    'work.c3.body': 'A desktop music player that reads cover art and embedded lyrics straight from local files. Library view, immersive now-playing screen, and a compact mini-player — packaged for macOS.',
    'work.c3.role': 'Desktop app builder',
    'work.c3.detail': 'Local metadata, cover art, lyrics, and mini-player flow',
    'work.c3.status': 'Source available on GitHub',
    'work.c3.t1': 'Electron',
    'work.c3.t2': 'React / Vite',
    'work.c3.t3': 'Desktop app',
    'work.c4.title': 'Starship Odyssey',
    'work.c4.body': 'A physics puzzle game where you steer a ship by tractor beam — hauling cargo past storms and black holes across 10 procedurally generated levels, each reproducible from a seed.',
    'work.c4.role': 'Game designer + Pygame developer',
    'work.c4.detail': 'Seeded levels, tractor-beam steering, gravity hazards',
    'work.c4.status': 'Source available on GitHub',
    'work.c4.t1': 'Python / Pygame',
    'work.c4.t2': 'Procedural',
    'work.c4.t3': 'Physics game',

    'story.label': 'About',
    'story.title': 'Taste is a technical constraint.',
    'story.bio:html': 'I like building things that feel <em>inhabited</em>: clear enough to use, specific enough to belong to someone, and strange enough to keep thinking about.',
    'story.p1.h': 'Start with behaviour.',
    'story.p1.b': 'A page can look beautiful in a screenshot and still be inert. The better question is what it does when someone comes back.',
    'story.p2.h': 'Make the invisible legible.',
    'story.p2.b': 'State, rhythm, constraints, and affordances should be felt through the interface before anyone needs them explained.',
    'story.p3.h': 'Keep the edge human.',
    'story.p3.b': 'Even technical work benefits from texture: good names, calm defaults, forgiving controls, and a little wit.',

    'parallax.title': 'London calling.',
    'parallax.sub': 'Where tradition keeps reinventing itself.',

    'desk.label': 'Desk',
    'desk.title': 'Things worth keeping open.',
    'desk.desc': 'Interests, shelves, and recurring obsessions — the kind that quietly grow into future pages.',
    'desk.d1.h': 'Reading shelf',
    'desk.d1.b': 'Interface history, systems thinking, game design, human–computer interaction, fiction that understands machines, and essays about attention.',
    'desk.d2.h': 'Listening desk',
    'desk.d2.b': 'Music tools, metadata, album art, lyrics — and the way a personal library quietly becomes emotional infrastructure.',
    'desk.d3.h': 'Play lab',
    'desk.d3.b': 'Small rule systems: cards, physics, resource loops, NPC behaviour, and the moment a mechanic starts teaching itself.',
    'desk.d4.h': 'Tool room',
    'desk.d4.b': 'Scripts, personal dashboards, prompts, deployment notes, and tiny utilities that remove friction from ordinary work.',

    'notes.label': 'Notes',
    'notes.title': 'Drafts for future pages.',
    'notes.desc': 'Written like doors, not summaries. A personal site gets better the moment it has places to wander.',
    'notes.n1.num': 'Note 01',
    'notes.n1.h': 'Interfaces as furniture',
    'notes.n1.b': 'Some tools should impress once. The best ones become part of the room: sturdy, quiet, always within reach.',
    'notes.n1.tag': 'Essay seed',
    'notes.n2.num': 'Note 02',
    'notes.n2.h': 'Why tiny apps matter',
    'notes.n2.b': 'Small software lets you practise judgement quickly: scope, defaults, naming, failure states, and the feel of the first click.',
    'notes.n2.tag': 'Build log',
    'notes.n3.num': 'Note 03',
    'notes.n3.h': 'The useful uncanny',
    'notes.n3.b': 'There is a sweet spot between utility and strangeness where people remember what they used — and reach for it again.',
    'notes.n3.tag': 'Design note',

    'contact.label': 'Contact',
    'contact.title:html': 'Bring a rough idea.<br>I like rough ideas.',
    'contact.desc': 'For prototypes, experiments, collaboration, or a stronger version of this site — start with the fastest channel.',
    'contact.email': 'Email',
    'contact.github': 'GitHub',
    'contact.p1.h': 'Format',
    'contact.p1.b': 'Static, fast, deployable, and deliberately easy to migrate into Astro or Next.js once the writing archive becomes real.',
    'contact.p2.h': 'Next obvious page',
    'contact.p2.b': 'A proper notebook: short posts, prototypes with source links, and a library of interface patterns worth reusing.',

    'footer.left': 'Designed and built by Kid Spartor.',
    'footer.right': 'Studio — always in motion.',
  },

  zh: {
    'nav.work': '作品',
    'nav.story': '自述',
    'nav.desk': '案头',
    'nav.notes': '札记',
    'nav.contact': '联络',

    'hero.eyebrow': '工作室索引 — 2026',
    'hero.title1': 'Kid Spartor',
    'hero.title2': '把有用之物',
    'hero.title3:html': '<em>留得稍稍古怪。</em>',
    'hero.subtitle': '软件、系统、器物、原型——以及那些让一个想法显得鲜活、却又不点破机关的界面细节。',
    'hero.s1': '做能经得起反复使用的界面，而不只是第一眼的惊艳。',
    'hero.s2': '趁粗糙的念头还没变得过于珍贵，先把它做成能用的东西。',
    'hero.s3': '让系统的聪明，藏在行为、克制与节奏里显露出来。',
    'hero.scroll': '向下，入场',

    'work.label': '若干方向',
    'work.title': '作品集可以是一只陈列柜，而非奖杯架。',
    'work.desc': '四件真正做出来、也跑得起来的东西：一门交互课程、一张全栈牌桌、一个桌面播放器，还有一个关于引力的小游戏。',
    'work.role': '职责',
    'work.detail': '关键细节',
    'work.status': '状态',
    'work.c1.title': '从零到 UNet',
    'work.c1.body': '一门纯浏览器里的深度学习课程——从单个感知机，一路到 UNet 图像分割。十一章全是 Canvas 驱动的交互演示：梯度下降热力图、滑动卷积、实时跳跃连接。零依赖，进度自动存在本地。',
    'work.c1.role': '课程作者与交互设计',
    'work.c1.detail': '用 Canvas 演示梯度、CNN 与 UNet 跳跃连接',
    'work.c1.status': '已发布在本站',
    'work.c1.t1': '深度学习',
    'work.c1.t2': 'Canvas / KaTeX',
    'work.c1.t3': '交互式课程',
    'work.c2.title': '德州扑克',
    'work.c2.body': '用 monorepo 搭起来的全栈德州扑克：共享的牌局引擎、一个 Web 客户端，还有 React Native 移动端。已部署上线 Vercel，另带一份安卓 .apk。',
    'work.c2.role': '牌局引擎与 Web / 移动端',
    'work.c2.detail': '同一套规则引擎驱动 Vercel Web 与 React Native',
    'work.c2.status': '在线演示可访问',
    'work.c2.t1': '全栈',
    'work.c2.t2': 'React Native',
    'work.c2.t3': '在线演示',
    'work.c3.title': '本地音乐播放器',
    'work.c3.body': '一个桌面音乐播放器，直接从本地文件读取封面与内嵌歌词。曲库视图、沉浸式播放页，外加一个小巧的迷你播放器——打包为 macOS 应用。',
    'work.c3.role': '桌面应用开发',
    'work.c3.detail': '本地元数据、封面、歌词与迷你播放器流程',
    'work.c3.status': '源码已在 GitHub',
    'work.c3.t1': 'Electron',
    'work.c3.t2': 'React / Vite',
    'work.c3.t3': '桌面应用',
    'work.c4.title': '星舰漫游',
    'work.c4.body': '一款物理解谜游戏：用牵引光束操控飞船，载着货物穿过风暴与黑洞，闯过 10 个程序生成的关卡——每关都能凭种子复现。',
    'work.c4.role': '游戏设计与 Pygame 开发',
    'work.c4.detail': '种子关卡、牵引光束操控、重力危险物',
    'work.c4.status': '源码已在 GitHub',
    'work.c4.t1': 'Python / Pygame',
    'work.c4.t2': '程序生成',
    'work.c4.t3': '物理游戏',

    'story.label': '关于',
    'story.title': '品味，是一项技术约束。',
    'story.bio:html': '我喜欢做有<em>人住过</em>气息的东西：清楚到能用，具体到像属于某个人，又古怪到让人念念不忘。',
    'story.p1.h': '从行为出发。',
    'story.p1.b': '一个页面可以在截图里很美，却毫无生气。更值得问的是：当有人再次回来，它会做什么。',
    'story.p2.h': '让看不见的，变得可读。',
    'story.p2.b': '状态、节奏、约束与可操作性，应当先经由界面被感知，而非等到非解释不可。',
    'story.p3.h': '让边缘保有人味。',
    'story.p3.b': '再技术的工作也受益于质感：好的命名、克制的默认值、宽容的控件，和一点点机智。',

    'parallax.title': '伦敦在召唤。',
    'parallax.sub': '传统在此处不断重塑自身。',

    'desk.label': '案头',
    'desk.title': '值得一直摊开着的东西。',
    'desk.desc': '兴趣、书架，与反复出现的执念——那种会悄悄长成未来页面的东西。',
    'desk.d1.h': '阅读架',
    'desk.d1.b': '界面史、系统思维、游戏设计、人机交互、懂机器的小说，以及关于"注意力"的随笔。',
    'desk.d2.h': '聆听台',
    'desk.d2.b': '音乐工具、元数据、专辑封面、歌词——以及一座私人曲库如何悄然成为情感的基础设施。',
    'desk.d3.h': '游玩实验室',
    'desk.d3.b': '小型规则系统：卡牌、物理、资源循环、NPC 行为，以及某个机制开始自我教学的那一刻。',
    'desk.d4.h': '工具间',
    'desk.d4.b': '脚本、个人仪表盘、提示词、部署笔记，以及那些替日常工作除去摩擦的小工具。',

    'notes.label': '札记',
    'notes.title': '写给未来页面的草稿。',
    'notes.desc': '它们写得像门，而非摘要。一个个人站点，从拥有可以游荡的去处那一刻起，才真正变好。',
    'notes.n1.num': '札记 01',
    'notes.n1.h': '界面即家具',
    'notes.n1.b': '有些工具只需惊艳一次。最好的那些会成为房间的一部分：结实、安静、随手可及。',
    'notes.n1.tag': '随笔种子',
    'notes.n2.num': '札记 02',
    'notes.n2.h': '小程序为何重要',
    'notes.n2.b': '小软件让你迅速练习判断力：范围、默认值、命名、失败状态，以及第一次点击的手感。',
    'notes.n2.tag': '构建日志',
    'notes.n3.num': '札记 03',
    'notes.n3.h': '有用的诡异',
    'notes.n3.b': '在实用与古怪之间，有一处甜蜜地带——人们会记得自己用过什么，并想再次伸手去碰。',
    'notes.n3.tag': '设计笔记',

    'contact.label': '联络',
    'contact.title:html': '带一个粗糙的想法来。<br>我喜欢粗糙的想法。',
    'contact.desc': '原型、实验、合作，或是想要一个更强的版本的本站——从最快的渠道开始。',
    'contact.email': '邮件',
    'contact.github': 'GitHub',
    'contact.p1.h': '形态',
    'contact.p1.b': '静态、快速、可部署，并刻意保持易于迁移——等写作存档成形，就搬进 Astro 或 Next.js。',
    'contact.p2.h': '下一个显然的页面',
    'contact.p2.b': '一本像样的笔记：短文、附带源码链接的原型，以及一座值得复用的界面范式库。',

    'footer.left': '由 Kid Spartor 设计并构建。',
    'footer.right': '工作室 — 永远在运转。',
  },
}

const LANGS = ['en', 'zh']

export function getLang() {
  const saved = localStorage.getItem('lang')
  if (saved && LANGS.includes(saved)) return saved
  return navigator.language && navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

function applyLang(lang) {
  const dict = DICT[lang] || DICT.en
  document.documentElement.lang = lang === 'zh' ? 'zh' : 'en'
  document.documentElement.dataset.lang = lang

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n')
    const htmlKey = `${key}:html`
    if (htmlKey in dict) {
      el.innerHTML = dict[htmlKey]
    } else if (key in dict) {
      el.textContent = dict[key]
    }
  })

  // Toggle button shows the language you'd switch TO.
  const btnLabel = document.querySelector('#langToggle .lang-label')
  if (btnLabel) btnLabel.textContent = lang === 'zh' ? 'EN' : '中'
}

// Must run BEFORE hero.js splits the title into characters.
export function initI18n() {
  const lang = getLang()
  applyLang(lang)

  const toggle = document.getElementById('langToggle')
  if (toggle) {
    toggle.addEventListener('click', () => {
      const next = (document.documentElement.dataset.lang === 'zh') ? 'en' : 'zh'
      localStorage.setItem('lang', next)
      // Reload so every text-splitting / scroll animation re-initialises cleanly.
      location.reload()
    })
  }
}
