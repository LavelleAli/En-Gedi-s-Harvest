import PlannerApp from "@/frontend/planner/PlannerApp";

export const metadata = {
  title: "Garden planner",
  description: "Lay out raised and in-ground beds in 3D, see sun and shade for any day, and get companion, planting and watering advice for your zone.",
};

export default function Page() {
  return <PlannerApp />;
}
