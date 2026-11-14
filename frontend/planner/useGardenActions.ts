"use client";

// Every change the planner makes to the garden plan: editing, moving, adding and deleting beds and
// shade sources, turning them, and adding crops to a bed. New items are selected so their editor opens.
import { normalizeRot } from "./footprint";
import { OBSTACLES, clampToYard, newId, snapToGrid, type Bed, type BedType, type Garden, type Item, type Obstacle, type ObstacleKind } from "./model";

type Update = (fn: (g: Garden) => Garden) => void;

export function useGardenActions(garden: Garden, updateGarden: Update, setSelectedId: (id: string | null) => void, snapStep: number) {
  // Applies `make` to the item with this id, wherever it lives (beds or shade sources).
  const changeItem = (id: string, make: <T extends Item>(item: T, g: Garden) => T) =>
    updateGarden((g) => {
      const fix = <T extends Item>(item: T): T => (item.id === id ? make(item, g) : item);
      return { ...g, beds: g.beds.map(fix), obstacles: g.obstacles.map(fix) };
    });

  return {
    // Edits from the side panel. The patch only ever holds fields of the selected item's own kind.
    patchItem: (id: string, patch: Partial<Bed> | Partial<Obstacle>) => changeItem(id, (item, g) => clampToYard({ ...item, ...patch } as typeof item, g.yard)),

    // A move from the 3D view (drag or arrow keys). `step` is the grid it was snapped to, or 0.
    moveItem: (id: string, x: number, z: number, step: number) => changeItem(id, (item, g) => snapToGrid({ ...item, x, z }, g.yard, step)),

    // A turn from the 3D view's buttons or the R key: the new angle in degrees (any number; stored 0–359).
    // The item turns about its middle, then is kept inside the yard.
    rotateItem: (id: string, rot: number) => changeItem(id, (item, g) => clampToYard({ ...item, rot: normalizeRot(rot) }, g.yard)),

    deleteItem: (id: string) => {
      updateGarden((g) => ({ ...g, beds: g.beds.filter((b) => b.id !== id), obstacles: g.obstacles.filter((o) => o.id !== id) }));
      setSelectedId(null);
    },

    addBed: (type: BedType) => {
      const raised = type === "raised";
      const bed = snapToGrid<Bed>(
        {
          id: newId("bed"),
          kind: "bed",
          name: `${raised ? "Raised bed" : "In-ground bed"} ${garden.beds.length + 1}`,
          type,
          x: garden.yard.w / 2,
          z: garden.yard.d * 0.65,
          w: raised ? 4 : 8,
          d: raised ? 8 : 10,
          h: raised ? 1 : 0,
          crops: [],
        },
        garden.yard,
        snapStep,
      );
      updateGarden((g) => ({ ...g, beds: [...g.beds, bed] }));
      setSelectedId(bed.id);
    },

    addObstacle: (kind: ObstacleKind) => {
      const preset = OBSTACLES[kind];
      const item = snapToGrid<Obstacle>(
        { id: newId(kind), kind, name: preset.label, x: garden.yard.w / 2, z: garden.yard.d / 3, w: preset.w, d: preset.d, h: preset.h },
        garden.yard,
        snapStep,
      );
      updateGarden((g) => ({ ...g, obstacles: [...g.obstacles, item] }));
      setSelectedId(item.id);
    },

    // Adds copies made in the Shade sources panel; selects one of them when asked.
    addObstacles: (newItems: Obstacle[], selectId?: string) => {
      updateGarden((g) => ({ ...g, obstacles: [...g.obstacles, ...newItems] }));
      if (selectId) setSelectedId(selectId);
    },

    addCropToBed: (bedId: string, cropId: string) =>
      updateGarden((g) => ({ ...g, beds: g.beds.map((b) => (b.id === bedId && !b.crops.includes(cropId) ? { ...b, crops: [...b.crops, cropId] } : b)) })),
  };
}
