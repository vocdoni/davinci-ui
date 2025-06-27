'use client'

import { Award, ExternalLink, Info, Server, Shield } from 'lucide-react'
import { Button } from '~components/ui/button'
import { Card, CardContent } from '~components/ui/card'

export function DavinciInfoCard() {
  return (
    <Card className='border-davinci-callout-border bg-davinci-paper-base/80'>
      <CardContent className='p-6'>
        <div className='space-y-4'>
          <div className='flex items-start gap-3'>
            <div className='mt-1'>
              <Info className='h-5 w-5 text-davinci-black-alt' />
            </div>
            <div>
              <h2 className='text-lg font-semibold text-davinci-black-alt mb-2'>About DAVINCI</h2>
              <p className='text-sm text-davinci-black-alt/80'>
                DAVINCI brings secure, anonymous, and coercion-free voting to the masses. This mini-application
                demonstrates the capabilities of the DAVINCI testnet as an MVP.
              </p>
            </div>
          </div>

          <div className='space-y-4 pt-2'>
            <div className='flex items-start gap-3'>
              <Shield className='h-4 w-4 text-davinci-black-alt mt-0.5 flex-shrink-0' />
              <div>
                <h3 className='font-medium text-davinci-black-alt text-sm'>Secure, Anti-coercion & Anonymous</h3>
                <p className='text-xs text-davinci-black-alt/80'>
                  DAVINCI ensures your votes remain anonymous while maintaining verifiable results and removing the
                  possibility of vote buying.
                </p>
              </div>
            </div>

            <div className='flex items-start gap-3'>
              <Server className='h-4 w-4 text-davinci-black-alt mt-0.5 flex-shrink-0' />
              <div>
                <h3 className='font-medium text-davinci-black-alt text-sm'>Participate as a Worker</h3>
                <p className='text-xs text-davinci-black-alt/80'>
                  Run a worker to help process votes and strengthen the network.
                </p>
              </div>
            </div>

            <div className='flex items-start gap-3'>
              <Award className='h-4 w-4 text-davinci-black-alt mt-0.5 flex-shrink-0' />
              <div>
                <h3 className='font-medium text-davinci-black-alt text-sm'>Earn Rewards</h3>
                <p className='text-xs text-davinci-black-alt/80'>
                  Wallets used for creating votes are eligible for rewards in the DAVINCI ecosystem.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Learn More Button */}
        <div className='mt-6 pt-4 border-t border-davinci-callout-border'>
          <Button
            onClick={() => window.open('https://davinci.vote', '_blank', 'noopener,noreferrer')}
            className='w-full bg-davinci-black-alt hover:bg-davinci-black-alt/90 text-davinci-text-base'
          >
            <ExternalLink className='w-4 h-4 mr-2' />
            Learn more
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
