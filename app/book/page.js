import MonthSection from "@/components/sections/MonthSection";
import CalendarSection from "@/components/sections/CalendarSection";
import PlantsSection from "@/components/sections/PlantsSection";
import DoctorSection from "@/components/sections/DoctorSection";
import RecipesSection from "@/components/sections/RecipesSection";
import PantrySection from "@/components/sections/PantrySection";
import WaterSection from "@/components/sections/WaterSection";
import RemediesSection from "@/components/sections/RemediesSection";
import { BeesSection, ChickensSection, FishSection } from "@/components/sections/AnimalSections";

export const metadata = { title: "Whole book" };

// Every section on one page, for printing the full book. Each section starts on a new printed page.
export default function Page() {
  return (
    <div className="book">
      <div className="view noprint">
        <div className="callout y">
          <strong>Whole book</strong>
          <p>Everything on one page, with every plant opened. Use Print this page (or Cmd+P) to print it or save it as a PDF.</p>
        </div>
      </div>
      <MonthSection />
      <CalendarSection />
      <PlantsSection printAll />
      <DoctorSection />
      <RecipesSection />
      <PantrySection />
      <WaterSection />
      <RemediesSection />
      <div className="view"><BeesSection /></div>
      <div className="view"><ChickensSection /></div>
      <div className="view"><FishSection /></div>
    </div>
  );
}
