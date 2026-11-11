import { BEES_HTML, CHICKENS_HTML, FISH_HTML } from "@/frontend/data/animals";
import RichSection from "@/frontend/components/RichSection";
import { Hero } from "@/frontend/components/Photo";

// The guides' laws, permits and seasons are written for Georgia; this note says so up front.
function LocalRules({ what }) {
  return (
    <div className="callout b">
      <strong>Written for Georgia</strong>
      <p>
        The rules, permits and month-by-month timing in this guide are for Georgia (zones 7–8). Elsewhere, check your city or county and
        your state or provincial agriculture department for {what}, and shift the seasons to match your frost dates.
      </p>
    </div>
  );
}

export function BeesSection() {
  return (
    <>
      <Hero slot="hero-bees" alt="Beekeeper holding a frame of honeybees" />
      <LocalRules what="hive registration and setback rules" />
      <RichSection html={BEES_HTML} />
    </>
  );
}

export function ChickensSection() {
  return (
    <>
      <Hero slot="hero-chickens" alt="Backyard hens near their coop" />
      <LocalRules what="how many hens you can keep and coop setbacks" />
      <RichSection html={CHICKENS_HTML} />
    </>
  );
}

export function FishSection() {
  return (
    <>
      <Hero slot="hero-fish" alt="Backyard aquaponics tank and grow bed" />
      <LocalRules what="which fish species you may keep" />
      <RichSection html={FISH_HTML} />
    </>
  );
}
