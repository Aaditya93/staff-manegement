import { CarouselDemo } from "@/components/home/carousel-demo";
import { TestimonialsDemo } from "@/components/home/demo-testimonial";
import { Hero } from "@/components/home/landing-hero";

export const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Hero />
      <CarouselDemo />
      <TestimonialsDemo />
    </div>
  );
};
export default HomePage;
