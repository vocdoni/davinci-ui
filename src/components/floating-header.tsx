import { ExternalLink, Menu } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useMatch, useNavigate } from 'react-router-dom'
import { Button } from '~components/ui/button'
import { Card } from '~components/ui/card'
import { Sheet, SheetContent, SheetTrigger } from '~components/ui/sheet'
import ConnectWalletButtonMiniApp from './ui/connect-wallet-button-miniapp'

interface NavigationItem {
  value: string
  label: string
  href: string
  external?: boolean
  icon?: React.ReactNode
}

export function FloatingHeader() {
  const navigate = useNavigate()
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
          setIsVisible(false)
        } else {
          setIsVisible(true)
        }
        setLastScrollY(window.scrollY)
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlNavbar)
      return () => {
        window.removeEventListener('scroll', controlNavbar)
      }
    }
  }, [lastScrollY])

  const navigationItems: NavigationItem[] = [
    { value: 'create-vote', label: 'Create a Vote', href: '/' },
    { value: 'explore', label: 'Explore', href: '/explore' },
    { value: 'implement', label: 'SDK', href: '/implement' },
    { value: 'participate', label: 'Participate', href: '/participate' },
    {
      value: 'sequencer',
      label: 'Sequencer',
      href: 'https://sequencer1.davinci.vote/app',
      external: true,
    },
    {
      value: 'about',
      label: 'About',
      href: 'https://davinci.vote',
      external: true,
    },
    {
      value: 'whitepaper',
      label: 'Whitepaper',
      href: 'https://whitepaper.vocdoni.io',
      external: true,
    },
  ]

  const handleLinkClick = (href: string, external?: boolean) => {
    if (external) {
      window.open(href, '_blank', 'noopener,noreferrer')
    } else {
      navigate(href)
    }
  }

  const isActiveLink = (href: string) => {
    const match = useMatch({ path: href, end: href === '/' })
    return Boolean(match)
  }

  return (
    <div
      className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-6xl px-4 transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <Card className='bg-davinci-paper-base/95 backdrop-blur-md border border-davinci-callout-border/50 shadow-lg'>
        <div className='flex items-center justify-between p-4'>
          <Link to='/' className='flex items-center space-x-3'>
            <img src='/images/davinci-logo.png' alt='DAVINCI' className='h-8 w-auto' />
          </Link>

          <div className='hidden lg:block'>
            <nav className='flex items-center space-x-1'>
              {navigationItems.map((item) => (
                <button
                  key={item.value}
                  onClick={() => handleLinkClick(item.href, item.external)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 flex items-center gap-1 ${
                    isActiveLink(item.href)
                      ? 'bg-davinci-soft-neutral text-davinci-black-alt'
                      : 'text-davinci-black-alt hover:text-davinci-black-alt hover:bg-davinci-soft-neutral/50'
                  }`}
                >
                  {item.label}
                  {item.icon && item.icon}
                  {item.external && <ExternalLink className='w-3 h-3' />}
                </button>
              ))}
            </nav>
          </div>

          <div className='lg:hidden'>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant='outline' size='icon' className='border-davinci-callout-border'>
                  <Menu className='h-4 w-4' />
                </Button>
              </SheetTrigger>
              <SheetContent className='bg-davinci-paper-base'>
                <div className='flex flex-col space-y-4 mt-8'>
                  {navigationItems.map((item) => (
                    <button
                      key={item.value}
                      onClick={() => handleLinkClick(item.href, item.external)}
                      className={`flex items-center justify-start gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                        isActiveLink(item.href)
                          ? 'bg-davinci-soft-neutral text-davinci-black-alt'
                          : 'text-davinci-black-alt hover:text-davinci-black-alt hover:bg-davinci-soft-neutral/50'
                      }`}
                    >
                      {item.label}
                      {item.icon && item.icon}
                      {item.external && <ExternalLink className='w-3 h-3' />}
                    </button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className='w-40 flex justify-end'>
            <ConnectWalletButtonMiniApp />
          </div>
        </div>
      </Card>
    </div>
  )
}
