import { AboutTeaser } from "@/components/AboutTeaser";
import { HeroCarousel } from "@/components/HeroCarousel";
import { NewsSection } from "@/components/NewsSection";
import { ServicesSection } from "@/components/ServicesSection";

export default function HomePage() {
  return (
    <>
      <HeroCarousel />
      <NewsSection />
      <AboutTeaser />
      <ServicesSection />
    </>
  );
}
