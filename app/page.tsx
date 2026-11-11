import MonthSection from "@/frontend/sections/MonthSection";
import { Hero } from "@/frontend/components/Photo";

export default function Page() {
  return (
    <div className="view">
      <Hero slot="hero-garden" alt="Raised vegetable garden beds" />
      <MonthSection />
    </div>
  );
}
