import MonthSection from "@/frontend/sections/month/MonthSection";
import CalendarSection from "@/frontend/sections/calendar/CalendarSection";
import PlantsSection from "@/frontend/sections/plants/PlantsSection";
import DoctorSection from "@/frontend/sections/doctor/DoctorSection";
import RecipesSection from "@/frontend/sections/recipes/RecipesSection";
import PantrySection from "@/frontend/sections/recipes/PantrySection";
import WaterSection from "@/frontend/sections/water/WaterSection";
import RemediesSection from "@/frontend/sections/remedies/RemediesSection";
import { BeesSection, ChickensSection, FishSection } from "@/frontend/sections/animals/AnimalSections";
import Callout from "@/frontend/components/ui/Callout";
import { PAGE } from "@/frontend/components/ui/Page";

export const metadata = { title: "Whole book" };

// Each page (marked "view", see ui/Page.tsx) is set apart from the one before by a rule and 3rem of space
// on screen; on paper each starts a new sheet instead.
const BOOK = [
  "not-print:[&>.view+.view]:mt-12 not-print:[&>.view+.view]:border-t not-print:[&>.view+.view]:border-line-strong not-print:[&>.view+.view]:pt-12",
  "print:[&>.view]:break-before-page print:[&>.view:first-child]:break-before-auto",
].join(" ");

// Every section on one page, for printing the full book.
export default function Page() {
  return (
    <div className={BOOK}>
      <div className={`${PAGE} print:hidden`}>
        <Callout tone="yellow" title="Whole book">
          <p>Everything on one page, with every plant opened. Use Print this page (or Cmd+P) to print it or save it as a PDF.</p>
        </Callout>
      </div>
      <MonthSection />
      <CalendarSection />
      <PlantsSection allOpen />
      <DoctorSection />
      <RecipesSection />
      <PantrySection />
      <WaterSection />
      <RemediesSection />
      <div className={PAGE}>
        <BeesSection />
      </div>
      <div className={PAGE}>
        <ChickensSection />
      </div>
      <div className={PAGE}>
        <FishSection />
      </div>
    </div>
  );
}
