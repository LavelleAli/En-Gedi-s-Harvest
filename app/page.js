import MonthSection from "@/components/sections/MonthSection";
import { Hero } from "@/components/Photo";

export default function Page() {
  return (
    <div className="view">
      <Hero slot="hero-garden" alt="Raised vegetable garden beds" />
      <MonthSection />
    </div>
  );
}
