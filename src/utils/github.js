import { getLang } from './i18n.js'
import { renderIcons } from './icons.js'

const ENDPOINT = 'https://api.github.com/users/KidSpartor/repos?sort=updated&per_page=12'

const COPY = {
  en: {
    original: 'Original',
    fork: 'Research fork',
    loaded: 'Live from GitHub',
    fallback: 'Static public snapshot',
    empty: 'No public description yet.',
  },
  zh: {
    original: '原创项目',
    fork: '研究分支',
    loaded: '实时读取 GitHub',
    fallback: '公开仓库静态快照',
    empty: '暂时没有公开说明。',
  },
}

function createRepoCard(repo, copy) {
  const card = document.createElement('a')
  card.className = 'repo-card'
  card.href = repo.html_url
  card.target = '_blank'
  card.rel = 'noreferrer'

  const type = document.createElement('span')
  type.className = 'repo-type'
  const icon = document.createElement('i')
  icon.dataset.lucide = repo.fork ? 'git-fork' : 'code-xml'
  type.append(icon, document.createTextNode(repo.fork ? copy.fork : copy.original))

  const title = document.createElement('h3')
  title.textContent = repo.name

  const description = document.createElement('p')
  description.textContent = repo.description || copy.empty

  const language = document.createElement('span')
  language.className = 'repo-language'
  language.textContent = repo.language || 'Repository'

  card.append(type, title, description, language)
  return card
}

export async function initGithubSignal() {
  const grid = document.getElementById('githubSignal')
  const status = document.getElementById('githubSignalStatus')
  if (!grid || !status) return

  const copy = COPY[getLang()] || COPY.en

  try {
    const response = await fetch(ENDPOINT, {
      headers: { Accept: 'application/vnd.github+json' },
    })
    if (!response.ok) throw new Error(`GitHub API ${response.status}`)

    const repos = await response.json()
    const selected = repos
      .filter((repo) => !repo.archived)
      .sort((a, b) => Number(a.fork) - Number(b.fork))
      .slice(0, 3)

    if (!selected.length) throw new Error('No public repositories')

    grid.replaceChildren(...selected.map((repo) => createRepoCard(repo, copy)))
    renderIcons(grid)
    status.textContent = copy.loaded
  } catch (error) {
    status.textContent = copy.fallback
    console.info('Using the bundled public repository snapshot.', error)
  }
}
