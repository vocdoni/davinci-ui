import { NewsletterCard } from "@/components/newsletter-card";
import { ShareableLink } from "@/components/shareable-link";
import { VoteDisplay } from "@/components/vote-display";
import { TotalVotesCard, VoteParameters } from "@/components/vote-parameters";
import { VoteData } from "@/types/vote";
import { useEffect, useState } from "react";

// Pre-configured sample vote data showing a completed vote
const sampleCompletedVoteData = {
  id: "public-sample-completed",
  question:
    "How should the DAVINCI Community Treasury allocate the Q4 2024 budget?",
  description:
    "The DAVINCI community has accumulated 2.5M tokens in the treasury this quarter. This proposal seeks community input on how these funds should be allocated across different initiatives to maximize ecosystem growth and sustainability. The allocation will directly impact development priorities, community programs, and strategic partnerships for the next quarter.",
  choices: [
    {
      id: "1",
      text: "60% Development & Infrastructure, 25% Marketing & Partnerships, 15% Community Rewards",
    },
    {
      id: "2",
      text: "45% Development & Infrastructure, 35% Marketing & Partnerships, 20% Community Rewards",
    },
    {
      id: "3",
      text: "70% Development & Infrastructure, 15% Marketing & Partnerships, 15% Community Rewards",
    },
    {
      id: "4",
      text: "50% Development & Infrastructure, 20% Marketing & Partnerships, 30% Community Rewards",
    },
    {
      id: "5",
      text: "40% Development & Infrastructure, 40% Marketing & Partnerships, 20% Community Rewards",
    },
  ],
  votingMethod: "single-choice" as const,
  censusType: "ethereum-wallets" as const,
  duration: "168",
  durationUnit: "hours" as const,
  creator: "davinci-dao.eth",
  startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
  endTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago (ended)
  totalVotes: 3247,
  isActive: false, // Vote has ended
};

export default function PublicVoteSampleEndPage() {
  const [voteData, setVoteData] = useState<VoteData | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [currentTotalVotes, setCurrentTotalVotes] = useState(0);

  useEffect(() => {
    setIsClient(true);
    setVoteData(sampleCompletedVoteData);
    setCurrentTotalVotes(sampleCompletedVoteData.totalVotes);
  }, []);

  if (!isClient || !voteData) {
    return (
      <div className="px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-davinci-black-alt/30 border-t-davinci-black-alt rounded-full animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-davinci-black-alt">
              Loading vote results...
            </h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-davinci-digital-highlight rounded-full border border-davinci-callout-border mb-4">
            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
            <span className="text-sm font-medium text-davinci-black-alt">
              Vote Completed
            </span>
          </div>
          <h1 className="text-3xl font-bold text-davinci-black-alt mb-2 font-averia">
            Community Treasury Allocation Vote
          </h1>
          <p className="text-davinci-black-alt/80 max-w-3xl mx-auto">
            This is a demonstration of a completed voting process on the DAVINCI
            network. The community has successfully decided on the Q4 2024
            budget allocation with strong participation from token holders.
          </p>
        </div>

        {/* Demo Notice */}
        <div className="mb-8">
          <div className="bg-davinci-secondary-accent/20 border border-davinci-secondary-accent/40 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-davinci-secondary-accent rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-white">i</span>
              </div>
              <div>
                <h3 className="font-semibold text-davinci-black-alt mb-1">
                  Demo Vote Results
                </h3>
                <p className="text-sm text-davinci-black-alt/80">
                  This page demonstrates how completed votes appear on the
                  DAVINCI platform. The results shown are simulated for
                  demonstration purposes and showcase the platform's capability
                  to handle complex community governance decisions with
                  transparent, verifiable outcomes.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Vote Display (wider) */}
          <div className="lg:col-span-8">
            <VoteDisplay voteData={voteData} />
          </div>

          {/* Right Column - Info Cards */}
          <div className="lg:col-span-4 space-y-6">
            <TotalVotesCard
              voteData={voteData}
              currentTotalVotes={currentTotalVotes}
              voteEnded={true}
            />
            <ShareableLink voteId="public-sample-completed" />
            <VoteParameters voteData={voteData} />

            {/* Additional Demo Info Card */}
            <div className="bg-davinci-paper-base/80 border border-davinci-callout-border rounded-lg p-6">
              <h3 className="font-semibold text-davinci-black-alt mb-3">
                About This Demo
              </h3>
              <div className="space-y-3 text-sm text-davinci-black-alt/80">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-davinci-black-alt rounded-full mt-2 flex-shrink-0"></div>
                  <p>
                    <strong>Realistic Data:</strong> Vote counts and percentages
                    reflect authentic community engagement patterns.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-davinci-black-alt rounded-full mt-2 flex-shrink-0"></div>
                  <p>
                    <strong>Complete Workflow:</strong> Demonstrates the full
                    voting lifecycle from creation to final results.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-davinci-black-alt rounded-full mt-2 flex-shrink-0"></div>
                  <p>
                    <strong>Governance Ready:</strong> Shows how DAVINCI can
                    handle complex community decisions with multiple options.
                  </p>
                </div>
              </div>
            </div>

            <NewsletterCard />
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-davinci-digital-highlight/30 border border-davinci-callout-border rounded-lg p-6">
            <h4 className="font-semibold text-davinci-black-alt mb-3">
              Transparent Results
            </h4>
            <p className="text-sm text-davinci-black-alt/80">
              All vote results are cryptographically verifiable and permanently
              recorded on the blockchain, ensuring complete transparency and
              immutability.
            </p>
          </div>

          <div className="bg-davinci-soft-neutral/30 border border-davinci-callout-border rounded-lg p-6">
            <h4 className="font-semibold text-davinci-black-alt mb-3">
              Community Driven
            </h4>
            <p className="text-sm text-davinci-black-alt/80">
              This vote demonstrates how communities can make important
              decisions collectively, with every eligible member having an equal
              voice in the outcome.
            </p>
          </div>

          <div className="bg-davinci-secondary-accent/20 border border-davinci-callout-border rounded-lg p-6">
            <h4 className="font-semibold text-davinci-black-alt mb-3">
              Secure Process
            </h4>
            <p className="text-sm text-davinci-black-alt/80">
              The voting process includes anti-coercion protection, anonymous
              voting, and encrypted results until the voting period concludes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
