// The oral rehydration solution recipe: the remedy with the strongest evidence, so it comes first.
import Packet from "@/frontend/components/ui/Packet";
import Steps from "@/frontend/components/ui/Steps";

export default function RehydrationPacket() {
  return (
    <Packet tone="red" title="Oral rehydration solution" badge="1 liter">
      <Steps ordered>
        <li>Start with 1 liter (about 4¼ cups) of safe water, boiled and cooled if needed.</li>
        <li>
          Stir in 6 <b>level</b> teaspoons sugar and ½ <b>level</b> teaspoon salt. Measure carefully; too much salt is harmful.
        </li>
        <li>Sip small amounts often. Make a fresh batch every 24 hours.</li>
      </Steps>
      <p>For babies and young children, use a store-bought pediatric solution and call their doctor.</p>
    </Packet>
  );
}
