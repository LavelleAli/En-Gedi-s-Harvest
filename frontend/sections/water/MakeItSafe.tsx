// The three ways to make water safe, side by side: clear it, boil it (best), or leave it in the sun.
import Packet from "@/frontend/components/ui/Packet";
import Steps from "@/frontend/components/ui/Steps";
import Columns from "@/frontend/components/ui/Columns";

export default function MakeItSafe() {
  return (
    // As many 16rem columns as fit: three across on a wide screen, stacked on a phone.
    <Columns min={16}>
      <Packet tone="blue" title="1. Clear it">
        <Steps ordered>
          <li>Let water sit in a bucket a few hours so dirt settles.</li>
          <li>Dip off the clear water on top.</li>
          <li>Pour it through a clean cloth, paper towel or coffee filter.</li>
        </Steps>
      </Packet>
      <Packet tone="blue" title="2. Boil it (best)">
        <Steps ordered>
          <li>Hold a rolling boil for 1 minute, or 3 minutes above 6,500 ft (about 2,000 m), where water boils at a lower temperature.</li>
          <li>Cool it and store in clean containers with tight lids.</li>
          <li>Fix the flat taste by pouring between two containers or adding a pinch of salt per quart.</li>
        </Steps>
      </Packet>
      <Packet tone="blue" title="Or: sunlight">
        <Steps ordered>
          <li>Fill clean, clear plastic bottles with clear water.</li>
          <li>Lay them on their sides in full sun, on a dark surface if you can.</li>
          <li>Leave 6 hours if sunny, 2 full days if cloudy.</li>
        </Steps>
      </Packet>
    </Columns>
  );
}
