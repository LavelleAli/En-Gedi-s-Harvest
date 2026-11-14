import MonthSection from "@/frontend/sections/month/MonthSection";
import { Hero } from "@/frontend/components/Photo";
import { PAGE } from "@/frontend/components/ui/Page";

export default function Page() {
  return (
    <div className={PAGE}>
      <Hero slot="hero-garden" alt="Raised vegetable garden beds" />
      <MonthSection />
    </div>
  );
}
