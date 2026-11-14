// The plant doctor's closing packet: a five-step checkup to do once a week.
import Packet from "@/frontend/components/ui/Packet";
import Steps from "@/frontend/components/ui/Steps";

export default function WeeklyCheckup() {
  return (
    <Packet title="Quick checkup, once a week">
      <Steps ordered>
        <li>Look under leaves, where most pests hide.</li>
        <li>
          Compare new top growth with older lower leaves. Problems that start low are often feeding or water; problems that start high are
          often pests or disease.
        </li>
        <li>Push a finger 2 inches into the soil. Dry means water; soggy clay means stop watering and improve drainage.</li>
        <li>Pull and bag any badly diseased leaves. Don&apos;t compost them.</li>
        <li>Water the soil, not the leaves, and water in the morning so foliage dries by evening.</li>
      </Steps>
    </Packet>
  );
}
