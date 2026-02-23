import './style.css'

const BASE = import.meta.env.BASE_URL

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '0:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const ss = String(s).padStart(2, '0')
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${ss}`
  return `${m}:${ss}`
}

function escapeHtml(str) {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

function formatMonthLabel(month) {
  const [y, m] = month.split('-')
  return `${parseInt(y)}年${parseInt(m)}月`
}

function formatMonthShort(month) {
  const [, m] = month.split('-')
  return `${parseInt(m)}月`
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function createVideoCard(video, index) {
  const card = document.createElement('a')
  card.className = 'video-card'
  card.href = `https://www.youtube.com/watch?v=${video.id}`
  card.target = '_blank'
  card.rel = 'noopener noreferrer'
  card.style.animationDelay = `${index * 0.08}s`

  card.innerHTML = `
    <div class="video-thumb">
      <img
        src="https://img.youtube.com/vi/${encodeURIComponent(video.id)}/hqdefault.jpg"
        alt=""
        loading="lazy"
      />
      <span class="video-duration">${formatDuration(video.duration)}</span>
      <div class="video-play" aria-hidden="true">
        <div class="video-play-icon"></div>
      </div>
    </div>
    <div class="video-info">
      <div class="video-channel">${escapeHtml(video.channel)}</div>
      <div class="video-title">${escapeHtml(video.title)}</div>
    </div>
  `
  return card
}

let currentMonth = null

function renderMonthNav(months, active) {
  const nav = document.getElementById('month-nav')
  if (!nav || months.length <= 1) return

  nav.innerHTML = months.map(m => {
    const isActive = m === active
    return `<button class="month-btn${isActive ? ' month-btn--active' : ''}" data-month="${m}">${formatMonthLabel(m)}</button>`
  }).join('')

  nav.addEventListener('click', (e) => {
    const btn = e.target.closest('.month-btn')
    if (!btn || btn.dataset.month === currentMonth) return
    loadMonth(btn.dataset.month, months)
  })
}

async function loadMonth(month, months) {
  currentMonth = month
  const grid = document.getElementById('video-grid')

  try {
    const res = await fetch(`${BASE}data/${month}.json`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()

    // Update chip
    const metaEl = document.getElementById('header-meta')
    if (metaEl) {
      metaEl.textContent = `${formatMonthLabel(month)} · ${data.videos.length} tracks`
      metaEl.style.display = 'inline-block'
    }

    // Update nav active state
    document.querySelectorAll('.month-btn').forEach(btn => {
      btn.classList.toggle('month-btn--active', btn.dataset.month === month)
    })

    // Render cards (random order)
    if (grid) {
      grid.innerHTML = ''
      shuffle(data.videos).forEach((video, i) => {
        grid.appendChild(createVideoCard(video, i))
      })
    }
  } catch (err) {
    console.error('Failed to load month data:', err)
    if (grid) {
      grid.innerHTML = `<p style="color: var(--text-muted); grid-column: 1 / -1;">
        Failed to load data for ${month}.
      </p>`
    }
  }
}

async function init() {
  try {
    const res = await fetch(`${BASE}data/index.json`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const index = await res.json()

    const months = index.months || []
    const latest = index.latest || months[0]

    if (!latest) throw new Error('No months available')

    renderMonthNav(months, latest)
    await loadMonth(latest, months)
  } catch (err) {
    // Fallback: try legacy playlist.json
    console.warn('No index.json, trying legacy playlist.json:', err.message)
    try {
      const res = await fetch(`${BASE}data/playlist.json`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()

      const metaEl = document.getElementById('header-meta')
      if (metaEl && data.videos) {
        metaEl.textContent = `${data.videos.length} tracks`
        metaEl.style.display = 'inline-block'
      }

      const grid = document.getElementById('video-grid')
      if (grid && data.videos) {
        shuffle(data.videos).forEach((video, i) => {
          grid.appendChild(createVideoCard(video, i))
        })
      }
    } catch (fallbackErr) {
      console.error('Failed to load any playlist data:', fallbackErr)
      const grid = document.getElementById('video-grid')
      if (grid) {
        grid.innerHTML = `<p style="color: var(--text-muted); grid-column: 1 / -1;">
          Failed to load playlist data. Run <code>npm run fetch</code> to generate data.
        </p>`
      }
    }
  }
}

init()
