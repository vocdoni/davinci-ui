import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BadgeProps {
  text: string;
  className?: string;
}

export function Badge({ text, className }: BadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("border-card-foreground/50 w-fit font-heading", className)}
    >
      {text}
    </Badge>
  );
}
