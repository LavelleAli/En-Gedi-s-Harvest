// Two packets side by side: what to keep in the medicine cabinet, and when to get care right away.
import Packet from "@/frontend/components/ui/Packet";
import ToneList from "@/frontend/components/ui/ToneList";
import Columns from "@/frontend/components/ui/Columns";

export default function CabinetAndCare() {
  return (
    // Two columns where there's room (15rem each at least).
    <Columns min={15}>
      <Packet title="Medicine cabinet basics">
        <p>
          Pain and fever reducer (acetaminophen or ibuprofen), antihistamine, hydrocortisone cream, antibiotic ointment, bandages, thermometer.
          Follow each label&apos;s dosing.
        </p>
      </Packet>
      <Packet tone="red" title="Get care right away">
        <ToneList>
          <li>Trouble breathing, chest pain or confusion</li>
          <li>Little or no urine, dizziness, can&apos;t keep fluids down</li>
          <li>Blood in vomit or stool</li>
          <li>High fever that won&apos;t come down, or any fever in a baby under 3 months</li>
          <li>A deep, large, spreading-red or oozing wound or burn</li>
          <li>Symptoms past about a week, or getting worse</li>
        </ToneList>
        <p>
          <b>Emergency: 911. Poison Control: 1-800-222-1222.</b>
        </p>
      </Packet>
    </Columns>
  );
}
