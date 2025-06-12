import { Award, ExternalLink, Github, Zap } from 'lucide-react'
import { Button } from '~components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~components/ui/card'

export default function ParticipatePage() {
  return (
    <div className='px-4'>
      <div className='max-w-4xl mx-auto'>
        {/* Page Header */}
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold text-davinci-black-alt mb-4 font-averia'>Participate</h1>
          <p className='text-lg text-davinci-black-alt/80 max-w-2xl mx-auto'>
            Join the DAVINCI network by running a worker and earn rewards. Soon you will also be able to run a
            sequencer.
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
                Worker nodes are crucial for processing votes and maintaining the integrity of the DAVINCI network.
              </p>

              <p className='text-davinci-black-alt/80'>
                By running a worker node, you actively participate in the decentralized infrastructure that powers
                DAVINCI votes. Your node will help validate transactions, relay information, and contribute to the
                overall security and efficiency of the voting process.
              </p>

              <p className='text-davinci-black-alt/80'>
                Setting up a worker node requires some technical knowledge. Detailed instructions and requirements can
                be found in the official Vocdoni documentation. (Imagine a link here to specific docs on running a
                worker node).
              </p>

              <div className='space-y-3'>
                <h4 className='font-semibold text-davinci-black-alt'>Key responsibilities of a worker node:</h4>
                <div className='space-y-2'>
                  <div className='flex items-start gap-3'>
                    <div className='w-2 h-2 bg-davinci-black-alt rounded-full mt-2 flex-shrink-0'></div>
                    <p className='text-davinci-black-alt/80'>Processing vote transactions.</p>
                  </div>
                  <div className='flex items-start gap-3'>
                    <div className='w-2 h-2 bg-davinci-black-alt rounded-full mt-2 flex-shrink-0'></div>
                    <p className='text-davinci-black-alt/80'>Storing and serving parts of the vote data.</p>
                  </div>
                  <div className='flex items-start gap-3'>
                    <div className='w-2 h-2 bg-davinci-black-alt rounded-full mt-2 flex-shrink-0'></div>
                    <p className='text-davinci-black-alt/80'>
                      Participating in the consensus mechanism (if applicable to the specific role).
                    </p>
                  </div>
                </div>
              </div>

              <div className='flex justify-start'>
                <Button
                  className='bg-davinci-black-alt hover:bg-davinci-black-alt/90 text-davinci-text-base'
                  onClick={() => window.open('https://github.com/vocdoni/davinci-sdk', '_blank')}
                >
                  <Github className='w-4 h-4 mr-2' />
                  View on GitHub
                </Button>
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
                  onClick={() => window.open('https://vocdoni.io', '_blank')}
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
