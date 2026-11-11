import CalendarSection from "@/frontend/sections/CalendarSection";

export const metadata = {
  title: "Calendar",
  description: "Month-by-month planting and harvest calendar, adjusted for your hardiness zone.",
};

export default function Page() {
  return <CalendarSection />;
}
