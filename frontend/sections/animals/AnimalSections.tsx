// The bees, chickens and fish pages: a photo, a note that the guide is written for Georgia, then the guide.
import { Hero } from "@/frontend/components/Photo";
import BeesGuide from "./BeesGuide";
import ChickensGuide from "./ChickensGuide";
import FishGuide from "./FishGuide";
import LocalRules from "./LocalRules";

export function BeesSection() {
  return (
    <>
      <Hero slot="hero-bees" alt="Beekeeper holding a frame of honeybees" />
      <LocalRules what="hive registration and setback rules" />
      <BeesGuide />
    </>
  );
}

export function ChickensSection() {
  return (
    <>
      <Hero slot="hero-chickens" alt="Backyard hens near their coop" />
      <LocalRules what="how many hens you can keep and coop setbacks" />
      <ChickensGuide />
    </>
  );
}

export function FishSection() {
  return (
    <>
      <Hero slot="hero-fish" alt="Backyard aquaponics tank and grow bed" />
      <LocalRules what="which fish species you may keep" />
      <FishGuide />
    </>
  );
}
