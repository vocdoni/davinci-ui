"use client";

import { motion } from "framer-motion";
import Image from "next/image";

import { Grainify } from "@/components/grainify";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BgVocdoniProtocolDavinciProps {
  className?: string;
}

export function BgVocdoniProtocolDavinci({ className }: BgVocdoniProtocolDavinciProps) {
  return (
    <section
      className={cn(
        "w-full flex flex-col rounded-3xl bg-accent text-accent-foreground relative isolate overflow-hidden sm:gap-y-16 gap-y-8 md:p-12 p-6",
        className,
      )}
    >
      <Grainify className="opacity-25" />
      <div className="bg-[rgba(255,255,255,0)] bg-[linear-gradient(#eaeaea_1.2px,_transparent_1.2px),_linear-gradient(to_right,_#eaeaea_1.2px,_rgba(255,255,255,0)_1.2px)] bg-[length:24px_24px] absolute inset-0 rounded-3xl -z-[1] opacity-10 [clip-path:circle(40%)]" />
      <motion.div
        animate={{ x: 0 }}
        initial={{ x: 150 }}
        transition={{ ease: "easeOut", type: "spring", duration: 2 }}
        whileHover={{}}
        className="absolute -z-[1]"
      >
        <Image alt="Image" src="/images/Group-10.png" width={700} height={500} />
      </motion.div>
      <div className="flex flex-col items-center gap-y-8">
        <h2 className="font-heading font-semibold tracking-tight text-balance sm:text-8xl text-center text-5xl">
          The universal voting protocol&lt;br&gt;
        </h2>
        <h1 className="text-center text-pretty text-lg max-w-md">
          Decentralized Autonomous Voting Infrastructure for Non-Coercive Inclusion
        </h1>
      </div>
      <Button className="rounded-full mx-auto">Start converting today&lt;br&gt;</Button>
    </section>
  );
}
