import { cn } from "@/lib/utils";

interface GradientProps {
  className?: string;
}

export function Gradient({ className }: GradientProps) {
  return (
    <div
      className={cn("size-64 [filter:blur(100px)] bg-secondary/50 -z-[1] md:size-80", className)}
    />
  );
}
