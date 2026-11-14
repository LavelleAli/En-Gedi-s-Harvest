// The plant doctor: a card for each common problem, comparing a healthy plant with the problem, then a
// weekly checkup. The encyclopedia's problem links open these cards by id (#sym-…).
import Reveal from "@/frontend/components/Reveal";
import SectionHeader from "@/frontend/components/ui/SectionHeader";
import { SYM } from "@/frontend/data/art";
import { OK_SLOT } from "@/frontend/data/healthy";
import SymptomCard from "./SymptomCard";
import WeeklyCheckup from "./WeeklyCheckup";
import Page from "@/frontend/components/ui/Page";

export default function DoctorSection() {
  return (
    <Page>
      <SectionHeader
        kicker="Healthy vs. unhealthy"
        title="Plant doctor"
        lead={
          <>
            Each card puts a healthy plant next to a common problem so you can match what you see. Photos come from Wikimedia Commons; where a
            photo is missing, a drawing shows the pattern. For a firm diagnosis, bring a sample to the{" "}
            local cooperative extension office (in the US, the <a href="https://www.nifa.usda.gov/land-grant-colleges-and-universities-partner-website-directory" target="_blank" rel="noopener noreferrer">land-grant university</a> for your state; in Fulton County, Georgia, the <a href="https://extension.uga.edu/county-offices/fulton.html" target="_blank" rel="noopener noreferrer">UGA Extension office</a>).
          </>
        }
      />
      {/* As many 19rem columns as fit; cards lower on the page fade up as they scroll into view. */}
      <Reveal className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,19rem),1fr))] gap-4">
        {Object.entries(SYM).map(([key, s], i) => (
          <SymptomCard key={key} id={key} symptom={s} healthySlot={OK_SLOT[s.ok]} tour={i === 0} />
        ))}
      </Reveal>
      <WeeklyCheckup />
    </Page>
  );
}
