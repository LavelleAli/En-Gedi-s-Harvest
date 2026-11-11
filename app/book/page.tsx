import MonthSection from "@/frontend/sections/MonthSection";
import CalendarSection from "@/frontend/sections/CalendarSection";
import PlantsSection from "@/frontend/sections/PlantsSection";
import DoctorSection from "@/frontend/sections/DoctorSection";
import RecipesSection from "@/frontend/sections/RecipesSection";
import PantrySection from "@/frontend/sections/PantrySection";
import WaterSection from "@/frontend/sections/WaterSection";
import RemediesSection from "@/frontend/sections/RemediesSection";
import { BeesSection, ChickensSection, FishSection } from "@/frontend/sections/AnimalSections";

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
      <PlantsSection />
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
