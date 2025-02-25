import Image from "next/image";

import { CarouselItem } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TestimonialItemProps {
  name: string;
  username: string;
  image: string;
  text: string;
  className?: string;
}

export function TestimonialItem({ name, username, image, text, className }: TestimonialItemProps) {
  return (
    <CarouselItem className={cn("md:basis-1/2 lg:basis-1/3", className)}>
      <div className="p-1 h-full">
        <Card className="bg-background text-foreground shadow-md size-full border-none">
          <CardContent className="flex flex-col gap-5 p-7 items-start border-none">
            <div className="flex items-center gap-4">
              <Image alt="Image" src={image} width={48} height={48} className="rounded-full" />
              <div>
                <p className="font-semibold leading-none">{name}</p>
                <p className="mt-1 leading-none text-muted-foreground">{username}</p>
              </div>
            </div>
            <p>{text}</p>
          </CardContent>
        </Card>
      </div>
    </CarouselItem>
  );
}
