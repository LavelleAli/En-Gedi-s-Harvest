// The sandbox: the 3D yard, with the camera buttons floating in its top-left corner, the sun-hours key
// under them when the map is on, the turn buttons in its bottom-right corner while something is selected,
// and the controls help underneath. three.js only runs in the browser, so the scene loads on the client
// in its own chunk, with a placeholder of the same size meanwhile. Not printed.
import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import CameraButtons from "../controls/CameraButtons";
import HeatLegend from "./HeatLegend";
import RotateButtons from "./RotateButtons";
import SceneHelp from "./SceneHelp";
import { SCENE_BOX } from "./sceneStyle";

const GardenScene = dynamic(() => import("../GardenScene"), {
  ssr: false,
  loading: () => <div className={`${SCENE_BOX} grid place-items-center text-muted`}>Loading the 3D yard…</div>,
});

type SceneAreaProps = ComponentProps<typeof GardenScene> & {
  onView: (mode: "3d" | "top") => void; // the camera buttons
};

export default function SceneArea({ onView, ...props }: SceneAreaProps) {
  const { garden, selectedId } = props;
  const selected = [...garden.beds, ...garden.obstacles].find((i) => i.id === selectedId);
  return (
    <div className="relative grid min-w-0 content-start gap-2 [grid-area:scene] print:hidden" data-tour="planner-scene">
      {/* The floating controls sit over the scene box only, not the help line under it. */}
      <div className="relative">
        <GardenScene {...props} />
        <CameraButtons mode={props.view} onView={onView} />
        {props.heat && <HeatLegend />}
        {selected && <RotateButtons item={selected} onRotate={props.onRotate} />}
      </div>
      <SceneHelp />
    </div>
  );
}
