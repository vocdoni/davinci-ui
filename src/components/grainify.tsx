import Image from "next/image";
import { cn } from "@/lib/utils";

interface GrainifyProps {
  className?: string;
}

export function Grainify({ className }: GrainifyProps) {
  return (
    <Image
      alt="Image"
      src="/images/grainy.svg"
      fill
      className={cn("absolute inset-0 opacity-50 object-cover -z-[1]", className)}
    />
  );
}
