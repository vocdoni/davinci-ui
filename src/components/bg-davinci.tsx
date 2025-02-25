import Image from "next/image";
import { cn } from "@/lib/utils";

interface BgDavinciProps {
  className?: string;
}

export function BgDavinci({ className }: BgDavinciProps) {
  return (
    <Image alt="Image" src="/images/Frame-1.png" width={500} height={500} className={className} />
  );
}
