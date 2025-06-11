import { Globe, Github } from 'lucide-react'

export function Footer() {
  const socialLinks = [
    {
      name: 'Website',
      url: 'https://davinci.vote',
      icon: <Globe className='w-5 h-5' />,
    },
    {
      name: 'GitHub',
      url: 'https://github.com/vocdoni',
      icon: <Github className='w-5 h-5' />,
    },
    {
      name: 'X (Twitter)',
      url: 'https://x.com/vocdoni',
      icon: (
        <svg className='w-5 h-5' viewBox='0 0 24 24' fill='currentColor'>
          <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
        </svg>
      ),
    },
    {
      name: 'Farcaster',
      url: 'https://farcaster.xyz/vocdoni',
      icon: (
        <svg className='w-5 h-5' role='img' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg' fill='currentColor'>
          <path d='M18.24 0.24H5.76C2.5789 0.24 0 2.8188 0 6v12c0 3.1811 2.5789 5.76 5.76 5.76h12.48c3.1812 0 5.76 -2.5789 5.76 -5.76V6C24 2.8188 21.4212 0.24 18.24 0.24m0.8155 17.1662v0.504c0.2868 -0.0256 0.5458 0.1905 0.5439 0.479v0.5688h-5.1437v-0.5688c-0.0019 -0.2885 0.2576 -0.5047 0.5443 -0.479v-0.504c0 -0.22 0.1525 -0.402 0.358 -0.458l-0.0095 -4.3645c-0.1589 -1.7366 -1.6402 -3.0979 -3.4435 -3.0979 -1.8038 0 -3.2846 1.3613 -3.4435 3.0979l-0.0096 4.3578c0.2276 0.0424 0.5318 0.2083 0.5395 0.4648v0.504c0.2863 -0.0256 0.5457 0.1905 0.5438 0.479v0.5688H4.3915v-0.5688c-0.0019 -0.2885 0.2575 -0.5047 0.5438 -0.479v-0.504c0 -0.2529 0.2011 -0.4548 0.4536 -0.4724v-7.895h-0.4905L4.2898 7.008l2.6405 -0.0005V5.0419h9.9495v1.9656h2.8219l-0.6091 2.0314h-0.4901v7.8949c0.2519 0.0177 0.453 0.2195 0.453 0.4724' />
        </svg>
      ),
    },
    {
      name: 'Bluesky',
      url: 'https://bsky.app/vocdoni.io',
      icon: <img src='/images/bluesky-logo.png' alt='Bluesky' className='w-5 h-5' />,
    },
  ]

  return (
    <footer className='bg-davinci-paper-base border-t border-davinci-callout-border mt-16'>
      <div className='max-w-6xl mx-auto px-4 py-8'>
        <div className='flex flex-col items-center space-y-6'>
          {/* Logo */}
          <div className='flex items-center space-x-3'>
            <img src='/images/davinci-logo.png' alt='DAVINCI' className='h-8 w-auto' />
          </div>

          {/* Social Links */}
          <div className='flex items-center space-x-6'>
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target='_blank'
                rel='noopener noreferrer'
                className='text-davinci-black-alt hover:text-davinci-black-alt/70 transition-colors duration-200'
                aria-label={link.name}
              >
                {link.icon}
              </a>
            ))}
          </div>

          {/* Copyright */}
          <div className='text-center text-sm text-davinci-black-alt/60'>
            <p>
              2024 DAVINCI. Built by{' '}
              <a
                href='https://vocdoni.io'
                target='_blank'
                rel='noopener noreferrer'
                className='hover:text-davinci-black-alt/80 underline'
              >
                Vocdoni
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
