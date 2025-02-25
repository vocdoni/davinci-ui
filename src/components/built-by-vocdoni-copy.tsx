import { ArrowRight } from "lucide-react";

import { Grainify } from "@/components/grainify";
import { Gradient } from "@/components/gradient";
import { Badge } from "@/components/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BuiltByVocdoniCopyProps {
  className?: string;
}

export function BuiltByVocdoniCopy({ className }: BuiltByVocdoniCopyProps) {
  return (
    <section
      className={cn(
        "w-full flex flex-col rounded-3xl relative isolate gap-y-8 bg-card text-card-foreground overflow-hidden md:p-12 p-6",
        className,
      )}
    >
      <Grainify />
      <Gradient className="absolute bottom-0 translate-y-1/2" />
      <div className="bg-[rgba(255,255,255,0)] bg-[linear-gradient(0deg,_rgba(255,255,255,0)_50%,_#eaeaea_50%)] bg-[length:12px_12px] absolute inset-0 -z-[1] opacity-50 translate-x-1/2 -translate-y-1/2 [clip-path:ellipse(50%_50%_at_50%_50%)]" />
      <Badge text="FEATURES" />
      <div className="flex flex-col gap-y-8">
        <h2 className="font-heading tracking-tight text-balance text-5xl font-light sm:text-7xl">
          A neutral universal protocol&lt;br&gt;
        </h2>
      </div>
      <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2">
        <div className="space-y-8">
          <div className="p-8 rounded-2xl bg-background shadow-md">
            <h3 className="font-heading text-2xl font-bold mb-4">Fast, Effective Workflow</h3>
            <p className="text-muted-foreground">
              Save hours of back-and-forth editing. Our AI highlights exactly where you can improve
              sentence structure, clarity, and persuasive impact.
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-background shadow-md">
            <h3 className="font-heading text-2xl font-bold mb-4">Real-Time Performance Insights</h3>
            <p className="text-muted-foreground">
              Track how your AI-optimized copy is performing across multiple channels. Adjust
              instantly to maximize reach and revenue.
            </p>
          </div>
        </div>
        <div className="p-8 rounded-2xl flex flex-col justify-between bg-background shadow-md">
          <div className="flex flex-col">
            <h3 className="font-heading text-2xl font-bold mb-4">
              Built by Vocdoni for the World&lt;br&gt;
            </h3>
            <p className="text-muted-foreground mb-6">
              Vocdoni is behind the launch and development of the &lt;br&gt;
            </p>
          </div>
          <Button className="rounded-full">
            Optimize my copy
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
