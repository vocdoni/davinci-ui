// note to sailors: static.davinci.vote is an alias to the netlify deploy
// app.davinci.vote is the real (final and used) domain of the app
// also note, before modifying this file, please do so in the repository file
// https://github.com/vocdoni/davinci-ui/blob/main/cf-worker.js

const origin = 'https://static.davinci.vote'
const destination = 'https://app.davinci.vote'
const sequencerUrl = 'https://sequencer1.davinci.vote'

function fitTitle(text) {
  return text.length > 32 ? text.slice(0, 29) + '…' : text
}

async function fetchMetadataTitle(processId) {
  // 1. Fetch process data
  const res = await fetch(`${sequencerUrl}/v1/processes/${processId}`)
  if (!res.ok) throw new Error(`Failed to fetch process ${processId}`)

  const json = await res.json()
  const metadataUrl = json?.metadata?.uri
  if (!metadataUrl || !metadataUrl.startsWith('https://')) {
    throw new Error('Invalid or missing metadata URI')
  }

  // 2. Fetch metadata
  const metaRes = await fetch(metadataUrl)
  if (!metaRes.ok) throw new Error('Failed to fetch metadata')

  const metadata = await metaRes.json()
  const title = metadata?.title ?? 'Vote'
  return fitTitle(title)
}

export default {
  async fetch(request) {
    const originalUrl = new URL(request.url)
    const pathname = originalUrl.pathname

    // bypass assets
    const isStaticAsset =
      pathname.startsWith('/assets/') ||
      pathname.endsWith('.js') ||
      pathname.endsWith('.css') ||
      pathname.endsWith('.map') ||
      pathname.endsWith('.ico') ||
      pathname.endsWith('.json') ||
      pathname.endsWith('.webmanifest') ||
      pathname.endsWith('.png') ||
      pathname.endsWith('.jpg')

    if (isStaticAsset) {
      const proxiedUrl = `${origin}${pathname}`
      return fetch(proxiedUrl, request)
    }

    // 1. Fetch HTML
    const res = await fetch(origin)
    let html = await res.text()

    // 2. Detect meta info based on pathname
    let title = 'DAVINCI'
    let imagePath = 'images/miniapp.png'

    if (pathname === '/') {
      title = 'Create vote'
    } else if (pathname === '/explore') {
      title = 'Explore'
      imagePath = 'images/miniapp_explore.png'
    } else if (pathname.startsWith('/vote/')) {
      imagePath = 'images/miniapp_vote.png'

      const processId = pathname.split('/')[2]
      try {
        title = await fetchMetadataTitle(processId)
      } catch (err) {
        // fallback a 'Vote' si falla
        title = 'Vote'
      }
    }

    const fullImageUrl = `${destination}/${imagePath}`

    // 3. fc:miniapp meta
    const miniappMeta = {
      version: '1',
      imageUrl: fullImageUrl,
      button: {
        title,
        action: {
          type: 'launch_miniapp',
          name: 'DAVINCI',
          url: `${destination}${pathname}`,
          splashImageUrl: `${destination}/light/android-chrome-512x512.png`,
          splashBackgroundColor: '#F5F1E8',
        },
      },
    }

    // 4. Inject in head
    const metaTag = `<meta name="fc:miniapp" content='${JSON.stringify(miniappMeta)}'>`
    html = html.replace('</head>', `${metaTag}</head>`)
    html = html.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)

    // 5. Return modified HTML
    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=UTF-8',
      },
    })
  },
}
