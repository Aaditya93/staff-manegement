import { MoveRight, Calendar, MapPin } from "lucide-react";
// import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

function Hero() {
  return (
    <div className="w-full mt-4 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-12 items-center lg:grid-cols-2">
          <div className="flex gap-6 flex-col">
            <Badge
              variant="outline"
              className="w-fit bg-primary/10 text-primary border-primary/20 "
            >
              Trusted DMC Partner
            </Badge>

            <div className="flex gap-6 flex-col">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-foreground">
                Elevate Your{" "}
                <span className="text-primary">Travel Packages</span>
              </h1>
              <p className="text-xl leading-relaxed text-muted-foreground max-w-xl">
                Victoria Tours is your premier Destination Management Company,
                providing travel agents with expertly crafted tour packages,
                personalized experiences, and seamless logistics for
                unforgettable journeys.
              </p>
            </div>
            {/* 
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <Button size="lg" className="gap-2" variant="outline">
                Schedule Consultation <Calendar className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Explore Packages <MoveRight className="w-4 h-4" />
              </Button>
            </div> */}

            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">
                Serving top destinations worldwide
              </span>
            </div>
          </div>

          <div className="relative rounded-xl overflow-hidden aspect-[4/5] md:aspect-square shadow-xl ring-1 ring-border">
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10 opacity-40"></div>
            <Image
              src="/home.jpg"
              alt="Beautiful travel destinations featuring crystal clear waters and tropical beaches"
              fill
              className="object-cover hover:scale-105 transition-transform duration-700"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero };
