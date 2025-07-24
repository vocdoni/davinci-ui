// note to sailors: static.davinci.vote is an alias to the netlify deploy
// app.davinci.vote is the real (final and used) domain of the app

const origin = 'https://static.davinci.vote'
const destination = 'https://app.davinci.vote'

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
      return fetch(proxiedUrl, request) // preserve method/headers
    }

    // 1. Fetch HTML
    const res = await fetch(origin) // there's only a single HTML ;)
    let html = await res.text()

    // 2. Detect meta info based on pathname
    let title = 'DAVINCI'
    let imagePath = 'images/opengraph_miniapp.png'

    if (pathname === '/') {
      title = 'Create vote'
      imagePath = 'images/opengraph_miniapp.png'
    } else if (pathname === '/explore') {
      title = 'Explore'
      imagePath = 'images/opengraph_explore.png'
    } else if (pathname.startsWith('/vote/')) {
      title = 'Vote'
      imagePath = 'images/opengraph_vote.png'
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
          splashImageUrl: `${origin}/icons/apple-touch-icon-1024.png`,
          splashBackgroundColor: '#F5F1E8',
        },
      },
    }

    const metaTag = `<meta name="fc:miniapp" content='${JSON.stringify(miniappMeta)}'>`

    // 4. Inject in head
    html = html.replace('</head>', `${metaTag}</head>`)

    // 5. Return modified HTML
    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=UTF-8',
      },
    })
  },
}
