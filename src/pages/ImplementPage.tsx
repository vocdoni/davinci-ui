import { CheckCircle, Code, Github } from 'lucide-react'
import { Button } from '~components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~components/ui/card'

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
                The DAVINCI SDK provides the tools you need to build voting functionalities into your applications.
              </p>

              <p className='text-davinci-black-alt/80'>
                To start using the DAVINCI SDK, you'll typically need to install it via your preferred package manager
                (e.g., npm, yarn). The SDK allows you to create, manage, and interact with votes on the Vocdoni network.
              </p>

              {/* Code Example */}
              <div className='bg-davinci-black-alt rounded-lg p-4 overflow-x-auto'>
                <pre className='text-davinci-text-base text-sm'>
                  <code>{`// Example: Basic SDK usage (conceptual)
import { DavinciSDK } from '@vocdoni/davinci-sdk';

async function createNewVote() {
  const sdk = new DavinciSDK({ /* configuration */ });
  const voteParams = { /* vote parameters */ };
  const voteId = await sdk.createVote(voteParams);
  console.log('Vote created with ID:', voteId);
}

createNewVote();`}</code>
                </pre>
              </div>

              <p className='text-davinci-black-alt/80'>
                For detailed installation instructions, API reference, and usage examples, please refer to our official
                GitHub repository.
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

          {/* Key Features Section */}
          <Card className='border-davinci-callout-border'>
            <CardHeader className='bg-davinci-paper-base'>
              <CardTitle className='flex items-center gap-2 text-davinci-black-alt'>
                <CheckCircle className='w-5 h-5' />
                Key Features
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4 pt-6 bg-davinci-text-base'>
              <div className='space-y-4'>
                <div className='flex items-start gap-3'>
                  <div className='w-2 h-2 bg-davinci-black-alt rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-davinci-black-alt/80'>
                    <strong className='text-davinci-black-alt'>Create various types of votes</strong> (single choice,
                    multi-choice, quadratic).
                  </p>
                </div>

                <div className='flex items-start gap-3'>
                  <div className='w-2 h-2 bg-davinci-black-alt rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-davinci-black-alt/80'>
                    <strong className='text-davinci-black-alt'>Define census mechanisms</strong> for voter eligibility.
                  </p>
                </div>

                <div className='flex items-start gap-3'>
                  <div className='w-2 h-2 bg-davinci-black-alt rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-davinci-black-alt/80'>
                    <strong className='text-davinci-black-alt'>Securely cast and tally votes.</strong>
                  </p>
                </div>

                <div className='flex items-start gap-3'>
                  <div className='w-2 h-2 bg-davinci-black-alt rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-davinci-black-alt/80'>
                    <strong className='text-davinci-black-alt'>Query vote results</strong> and participation data.
                  </p>
                </div>

                <div className='flex items-start gap-3'>
                  <div className='w-2 h-2 bg-davinci-black-alt rounded-full mt-2 flex-shrink-0'></div>
                  <p className='text-davinci-black-alt/80'>
                    <strong className='text-davinci-black-alt'>Extensible architecture</strong> for custom integrations.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
