import { CarouselDemo } from "@/components/home/carousel-demo";
import { TestimonialsDemo } from "@/components/home/demo-testimonial";
import { Hero } from "@/components/home/landing-hero";

export const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Hero />
      <CarouselDemo />
      <TestimonialsDemo />
      {/* <LandingHero />
      <div>
        <div className="min-h-[700px] flex flex-col justify-start border border-dashed rounded-lg space-y-2 my-10">
          <div className="text-center pt-8 pb-0">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary">
              {t("title")}
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mt-2 max-w-3xl mx-auto px-4 mb-2">
              {t("welcome")}
            </p>
          </div>
          <div className="flex-1 p-0 mt-0">
            <ThreeDPhotoCarousel />
            <div className="flex justify-center items-center  border border-dashed">
              <Testimonials />
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};
export default HomePage;
