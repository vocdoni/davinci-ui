import { NewsletterCard } from "@/components/newsletter-card";
import { ShareableLink } from "@/components/shareable-link";
import { VoteDisplay } from "@/components/vote-display";
import { TotalVotesCard, VoteParameters } from "@/components/vote-parameters";
import { VoteData } from "@/types/vote";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// Sample vote data as fallback
const sampleVoteData = {
  id: "vote-123",
  question:
    "Should the DAVINCI protocol implement quadratic funding for community projects?",
  description:
    "This proposal aims to introduce quadratic funding mechanisms to better allocate community treasury funds to projects that have broad community support while preventing whale dominance in funding decisions.",
  choices: [
    { id: "1", text: "Yes, implement quadratic funding immediately" },
    { id: "2", text: "Yes, but with a 6-month trial period first" },
    { id: "3", text: "No, keep the current funding mechanism" },
    { id: "4", text: "No, but explore alternative funding methods" },
  ],
  votingMethod: "single-choice" as const,
  censusType: "ethereum-wallets" as const,
  duration: "72",
  durationUnit: "hours" as const,
  creator: "dao-treasury.eth",
  startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
  endTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
  totalVotes: 1247,
  isActive: true,
  multipleChoiceMin: "1",
  multipleChoiceMax: "3",
  quadraticCredits: "100",
};

export default function VotePage() {
  const params = useParams();
  const [voteData, setVoteData] = useState<VoteData | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTotalVotes, setCurrentTotalVotes] = useState(0);
  const [voteEnded, setVoteEnded] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const loadVoteData = () => {
      try {
        const storedVote = localStorage.getItem(`vote-${params.id}`);
        if (storedVote) {
          const parsedVote = JSON.parse(storedVote);
          const voteWithDates = {
            ...parsedVote,
            startTime: new Date(parsedVote.startTime),
            endTime: new Date(parsedVote.endTime),
          };
          setVoteData(voteWithDates);
          setCurrentTotalVotes(voteWithDates.totalVotes);

          // Check if vote has ended
          const now = new Date();
          setVoteEnded(now > voteWithDates.endTime);
        } else {
          setVoteData(sampleVoteData);
          setCurrentTotalVotes(sampleVoteData.totalVotes);

          // Check if sample vote has ended
          const now = new Date();
          setVoteEnded(now > sampleVoteData.endTime);
        }
      } catch (error) {
        console.error("Error loading vote data:", error);
        setVoteData(sampleVoteData);
        setCurrentTotalVotes(sampleVoteData.totalVotes);
      } finally {
        setIsLoading(false);
      }
    };

    loadVoteData();
  }, [params.id]);

  // Simulate vote count increases while voting is active
  useEffect(() => {
    if (!voteEnded && voteData?.isActive) {
      const interval = setInterval(() => {
        setCurrentTotalVotes((prev) => prev + Math.floor(Math.random() * 3));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [voteEnded, voteData?.isActive]);

  if (!isClient || isLoading) {
    return (
      <div className="px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-davinci-black-alt/30 border-t-davinci-black-alt rounded-full animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-davinci-black-alt">
              Loading vote...
            </h1>
          </div>
        </div>
      </div>
    );
  }

  if (!voteData) {
    return (
      <div className="px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-davinci-black-alt mb-4">
              Vote Not Found
            </h1>
            <p className="text-davinci-black-alt/80">
              The vote you're looking for doesn't exist or has been removed.
            </p>
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
          <h1 className="text-3xl font-bold text-davinci-black-alt mb-2 font-averia">
            Vote #{params.id}
          </h1>
          <p className="text-davinci-black-alt/80">
            Cast your vote on this important community decision
          </p>
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
              voteEnded={voteEnded}
            />
            <ShareableLink voteId={params.id as string} />
            <VoteParameters voteData={voteData} />
            <NewsletterCard />
          </div>
        </div>
      </div>
    </div>
  );
}
