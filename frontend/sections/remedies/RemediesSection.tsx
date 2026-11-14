// The home remedies page: oral rehydration solution, a table of common symptoms and remedies with
// their safety limits, the medicine cabinet basics, and when to get care right away.
import SectionHeader from "@/frontend/components/ui/SectionHeader";
import SourceNote from "@/frontend/components/ui/SourceNote";
import CabinetAndCare from "./CabinetAndCare";
import RehydrationPacket from "./RehydrationPacket";
import RemedyTable from "./RemedyTable";
import Page from "@/frontend/components/ui/Page";

export default function RemediesSection() {
  return (
    <Page>
      <SectionHeader
        kicker="Comfort care"
        title="Simple home remedies"
        tone="red"
        lead={
          <>
            These ease minor, common symptoms. They don&apos;t treat infections or serious illness. Oral rehydration solution has the strongest
            evidence and can be lifesaving during diarrhea or vomiting.
          </>
        }
      />
      <RehydrationPacket />
      <RemedyTable />
      <CabinetAndCare />
      <SourceNote>
        ORS recipe:{" "}
        <a href="https://rehydrate.org/faq/how-to-prepare-ors.htm" target="_blank" rel="noopener noreferrer">
          Rehydration Project
        </a>
      </SourceNote>
    </Page>
  );
}
