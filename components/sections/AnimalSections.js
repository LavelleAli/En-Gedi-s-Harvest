import { BEES_HTML, CHICKENS_HTML, FISH_HTML } from "@/lib/animals";
import RichSection from "@/components/RichSection";
import { Hero } from "@/components/Photo";

export function BeesSection() {
  return (
    <>
      <Hero slot="hero-bees" alt="Beekeeper holding a frame of honeybees" />
      <RichSection html={BEES_HTML} />
    </>
  );
}

export function ChickensSection() {
  return (
    <>
      <Hero slot="hero-chickens" alt="Backyard hens near their coop" />
      <RichSection html={CHICKENS_HTML} />
    </>
  );
}

export function FishSection() {
  return (
    <>
      <Hero slot="hero-fish" alt="Backyard aquaponics tank and grow bed" />
      <RichSection html={FISH_HTML} />
    </>
  );
}
