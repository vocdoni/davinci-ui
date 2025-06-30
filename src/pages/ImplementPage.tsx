import { Code, Github } from 'lucide-react'
import { Button } from '~components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~components/ui/card'
import { Link } from '~components/ui/link'

export default function ImplementPage() {
  return (
    <div className='px-4'>
      <div className='max-w-4xl mx-auto'>
        {/* Page Header */}
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold text-davinci-black-alt mb-4 font-averia'>Implement DAVINCI</h1>
          <p className='text-lg text-davinci-black-alt/80 max-w-2xl mx-auto'>
            Integrate the DAVINCI SDK into your project to leverage decentralized voting.
          </p>
        </div>

        <div className='space-y-8'>
          {/* Getting Started Section */}
          <Card className='border-davinci-callout-border'>
            <CardHeader className='bg-davinci-paper-base'>
              <CardTitle className='flex items-center gap-2 text-davinci-black-alt'>
                <Code className='w-5 h-5' />
                Getting Started with DAVINCI SDK
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6 pt-6 bg-davinci-text-base'>
              <p className='text-davinci-black-alt/80'>
                We're making it super easy to plug DAVINCI into any app or service. Our goal is to keep things simple
                and developer-friendly, and our SDK is designed to help you get up and running with minimal hassle.
              </p>

              <p className='text-davinci-black-alt/80'>
                While the stable release of the SDK is still in progress, you don’t have to wait to get started. We’ve
                already made two fully functional examples available for you to explore:
              </p>

              <ul className='list-disc pl-6 text-davinci-black-alt/80'>
                <li>
                  <Link href='https://github.com/vocdoni/davinci-sdk/tree/main/examples/script' target='_blank'>
                    Script Example
                  </Link>
                  : A streamlined example that allows to execute the entire process of a DAVINCI vote, from setting up
                  and running a vote, to casting ballots and retrieving the final results.
                </li>
                <li>
                  <Link href='https://github.com/vocdoni/davinci-sdk/tree/main/examples/ui' target='_blank'>
                    UI Example
                  </Link>
                  : A visual interface that walks you through the entire process, from setting up a vote to casting a
                  ballot using DAVINCI.
                </li>
              </ul>

              <p className='text-davinci-black-alt/80'>
                Both are opensourced and ready to analyze, and designed to help you understand DAVINCI and start
                building on top of it.
              </p>

              <p className='text-davinci-black-alt/80'>
                Want a quick look in action?{' '}
                <Link href='https://vocdoni.github.io/davinci-sdk/' target='_blank'>
                  Try our live demo deployed on Sepolia
                </Link>
                .
              </p>

              <p>
                For the latest updates, technical details, and to show your support, check out our DAVINCI SDK
                repository and give it a ⭐️.
              </p>

              <div className='flex justify-start'>
                <Button
                  className='bg-davinci-black-alt hover:bg-davinci-black-alt/90 text-davinci-text-base'
                  onClick={() => window.open('https://github.com/vocdoni/davinci-sdk', '_blank')}
                >
                  <Github className='w-4 h-4 mr-2' />
                  DAVINCI SDK on GitHub
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
