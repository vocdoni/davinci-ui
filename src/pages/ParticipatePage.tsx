import { Award, Copy, ExternalLink, Github, Zap } from 'lucide-react'
import { useState } from 'react'
import { Button } from '~components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~components/ui/card'
import { toast } from '~hooks/use-toast'

// Helper component for copyable code blocks
function CodeBlock({ children, className = '' }: { children: string; className?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children)
      setCopied(true)
      toast({
        title: 'Copied to clipboard',
        description: 'Environment variable copied successfully',
      })
      setTimeout(() => setCopied(false), 2000)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast({
        title: 'Failed to copy',
        description: 'Please copy the text manually',
        variant: 'destructive',
      })
    }
  }

  return (
    <div
      className={`relative bg-gray-200 mt-2 border border-davinci-callout-border rounded-lg p-4 ${className}`}
    >
      <pre className="whitespace-pre-wrap break-words font-mono text-xs text-davinci-black-alt">
        <code>{children}</code>
      </pre>

      <Button
        variant='ghost'
        size='sm'
        className='absolute top-2 right-2 h-8 w-8 p-0'
        onClick={handleCopy}
        aria-label='Copy to clipboard'
      >
        <Copy className={`h-4 w-4 ${copied ? 'text-green-600' : 'text-davinci-black-alt/60'}`} />
      </Button>
    </div>
  )
}

// Helper component for external links
function ExternalLinkText({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target='_blank'
      rel='noopener noreferrer'
      className='text-davinci-black-alt underline hover:text-davinci-black-alt/80 transition-colors'
    >
      {children}
    </a>
  )
}

export default function ParticipatePage() {
  return (
    <div className='px-4'>
      <div className='max-w-4xl mx-auto'>
        {/* Page Header */}
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold text-davinci-black-alt mb-4 font-averia'>Participate</h1>
          <p className='text-lg text-davinci-black-alt/80 max-w-2xl mx-auto'>
            Join the DAVINCI testnet by running a worker and earn rewards. Soon you will also be able to run a full
            Sequencer.
          </p>
        </div>

        <div className='space-y-8'>
          {/* Run a Worker Node Section */}
          <Card className='border-davinci-callout-border'>
            <CardHeader className='bg-davinci-paper-base'>
              <CardTitle className='flex items-center gap-2 text-davinci-black-alt'>
                <Zap className='w-5 h-5' />
                Run a Worker Node
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6 pt-6 bg-davinci-text-base'>
              <p className='text-davinci-black-alt/80 font-medium'>
                Worker nodes are crucial to help Sequencers process votes and keep the network running fast and
                smoothly.
              </p>

              <div className='space-y-4'>
                <p className='text-davinci-black-alt/80'>
                  Setting up a worker node requires some technical knowledge, but we provide all the necessary tools and
                  resources to help you get started.
                </p>

                <div>
                  <h3 className='text-davinci-black-alt text-lg font-medium mb-2'>Requirements</h3>
                  <ul className='list-disc list-inside space-y-1 text-davinci-black-alt/80 ml-4'>
                    <li>Computer with stable internet connection.</li>
                    <li>At least 16 GB of RAM.</li>
                    <li>Docker installed.</li>
                  </ul>
                </div>

                <div>
                  <h3 className='text-davinci-black-alt text-lg font-medium mb-2'>Install instructions</h3>
                </div>
                <div>
                  <h4 className='text-davinci-black-alt font-medium mb-2'>1. Instructions</h4>
                  <p className='text-davinci-black-alt/80'>Go to Davinci <ExternalLinkText href='https://vocdoni.github.io/davinci-workers-registry/'>Worker Registry webapp</ExternalLinkText> to get your token. Ensure that the account used to create it matches with the worker address.</p>
                </div>
                <div>
                  <h4 className='text-davinci-black-alt font-medium mb-2'>2. Instructions</h4>
                  <p className='text-davinci-black-alt/80'>Clone the repository.</p>
                  <CodeBlock>git clone https://github.com/vocdoni/davinci-node.git && cd davinci-node</CodeBlock>
                </div>
                <div>
                  <h4 className='text-davinci-black-alt font-medium mb-2'>3. Copy the example ENV file</h4>
                  <p className='text-davinci-black-alt/80'>Find <code>.env.example</code> in the cloned directory and copy it to a new file named <code>.env</code>.</p>
                  <CodeBlock>cp .env.example .env</CodeBlock>
                </div>
                <div>
                  <h4 className='text-davinci-black-alt font-medium mb-2'>3. Configure worker variables</h4>
                  <p className='text-davinci-black-alt/80'>Configure worker-specific variables in the <code>.env</code> file.</p>
                  <CodeBlock>{`DAVINCI_WORKER_SEQUENCERURL="http://sequencer-host:9090/workers/<UUID>" # unique per sequencer
DAVINCI_WORKER_AUTHTOKEN="<generated_worker_authtoken>"                 # from step 1
DAVINCI_WORKER_ADDRESS="0x1111122222333334444455555666667777788888"     # used in step 1
DAVINCI_WORKER_NAME="my-awesome-davinci-worker"                         # a name for your worker`}</CodeBlock>
                  <p className='mt-4 text-davinci-black-alt/80'>Here is the URL of our main Sequencer:</p>
                  <CodeBlock>{`https://sequencer1.davinci.vote/workers/1744b84a-eca6-c7f0-2ebf-593f7234465f`}</CodeBlock>
                </div>
                <div>
                  <h4 className='text-davinci-black-alt font-medium mb-2'>4. Start the worker</h4>
                  <p className='text-davinci-black-alt/80'>Run the worker using docker compose. <code>--profile=prod</code> runs with <code>watchtower</code> enabled to support auto-updating.</p>
                  <CodeBlock>{`docker-compose --profile=prod up -d`}</CodeBlock>
                </div>
                <div>
                  <h4 className='text-davinci-black-alt font-medium mb-2'>5. Monitoring</h4>
                  <p className='text-davinci-black-alt/80'>Once your worker node is running, monitor its status and performance at{' '}<ExternalLinkText href='https://sequencer1.davinci.vote/app'>the Sequencer dashboard</ExternalLinkText>.</p>
                </div>

                <div className='pt-10'>
                  <p className='text-davinci-black-alt/80 mb-2'>
                    Detailed instructions and requirements can be found in the official DAVINCI node documentation:
                  </p>
                  <div className='flex justify-center'>
                    <Button
                      className='bg-davinci-black-alt hover:bg-davinci-black-alt/90 text-davinci-text-base'
                      onClick={() => window.open('https://github.com/vocdoni/davinci-node#-run-a-worker-node', '_blank')}
                    >
                      <Github className='w-4 h-4 mr-2' />
                      View on GitHub
                    </Button>
                  </div>
                </div>
              </div>


            </CardContent>
          </Card>

          {/* Reward Eligibility Section */}
          <Card className='border-davinci-callout-border'>
            <CardHeader className='bg-davinci-paper-base'>
              <CardTitle className='flex items-center gap-2 text-davinci-black-alt'>
                <Award className='w-5 h-5' />
                Reward Eligibility
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6 pt-6 bg-davinci-text-base'>
              <p className='text-davinci-black-alt/80 font-medium'>
                Participants who contribute to vote processing by running worker nodes may be eligible for rewards.
              </p>

              <p className='text-davinci-black-alt/80'>
                The DAVINCI protocol and the broader Vocdoni ecosystem are designed to incentivize participation. While
                specific reward mechanisms can vary and evolve, running a worker node reliably and honestly is generally
                a prerequisite for earning rewards.
              </p>

              <p className='text-davinci-black-alt/80'>
                Rewards can come in various forms, such as native protocol tokens or fees, depending on the network's
                tokenomics and governance model. Stay tuned to official Vocdoni channels for the latest information on
                incentives and reward programs for node operators.
              </p>

              <div className='bg-davinci-digital-highlight p-4 rounded-lg border border-davinci-callout-border'>
                <p className='text-sm text-davinci-black-alt/80'>
                  <strong className='text-davinci-black-alt'>Note:</strong> Reward structures are subject to change and
                  depend on the ongoing development and governance of the Vocdoni network.
                </p>
              </div>

              <div className='flex justify-start'>
                <Button
                  className='bg-davinci-black-alt hover:bg-davinci-black-alt/90 text-davinci-text-base'
                  onClick={() => window.open('https://davinci.deform.cc/waitlist/', '_blank')}
                >
                  <ExternalLink className='w-4 h-4 mr-2' />
                  Learn More About Rewards
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
