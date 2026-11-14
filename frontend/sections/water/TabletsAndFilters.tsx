// Two packets on store-bought treatment: tablets and drops, and filters and UV.
import Packet from "@/frontend/components/ui/Packet";
import ToneList from "@/frontend/components/ui/ToneList";
import Columns from "@/frontend/components/ui/Columns";

export default function TabletsAndFilters() {
  return (
    // Two columns where there's room (15rem each at least).
    <Columns min={15}>
      <Packet tone="blue" title="Tablets and drops">
        <ToneList>
          <li>Follow the package for chlorine dioxide, chlorine or iodine products.</li>
          <li>Chlorine dioxide is the only one that kills Cryptosporidium when used correctly.</li>
          <li>Skip iodine if pregnant, if you have thyroid problems or an iodine sensitivity, and never rely on it for more than a few weeks.</li>
        </ToneList>
      </Packet>
      <Packet tone="blue" title="Filters and UV">
        <ToneList>
          <li>Pore size of 1 micron or smaller stops parasites; 0.3 micron or smaller stops bacteria.</li>
          <li>No portable filter removes viruses, so disinfect after filtering.</li>
          <li>UV pens work only in small amounts of clear water.</li>
        </ToneList>
      </Packet>
    </Columns>
  );
}
