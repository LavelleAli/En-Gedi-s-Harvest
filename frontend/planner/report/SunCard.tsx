// The sun on the chosen day: sunrise, its highest point and sunset (with directions), and the hours of
// daylight, plus whether the angles come from real coordinates or an estimate for the zone.
import Card from "@/frontend/components/ui/Card";
import FactList from "@/frontend/components/ui/FactList";
import type { GardenLocation } from "@/frontend/lib/location";
import { compassPoint, formatClock, sunPosition, type SunTimes } from "../sun";

const TEN_MINUTES = 600000; // ms: the sun's direction is read just after sunrise and just before sunset

export default function SunCard({ times, location, date }: { times: SunTimes; location: GardenLocation; date: string }) {
  const { lat, lon, tz } = location;
  const noon = sunPosition(times.solarNoon, lat, lon);
  const nice = new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" });
  return (
    <Card className="grid content-start gap-2">
      <h3>Sun on {nice}</h3>
      <FactList>
        <dt>Sunrise</dt>
        <dd>
          {formatClock(times.sunrise, tz)}
          {times.sunrise ? ` in the ${compassPoint(sunPosition(times.sunrise + TEN_MINUTES, lat, lon).azimuth)}` : ""}
        </dd>
        <dt>Highest</dt>
        <dd>
          {formatClock(times.solarNoon, tz)}, {Math.max(0, Math.round(noon.altitude))}° up in the {compassPoint(noon.azimuth)}
        </dd>
        <dt>Sunset</dt>
        <dd>
          {formatClock(times.sunset, tz)}
          {times.sunset ? ` in the ${compassPoint(sunPosition(times.sunset - TEN_MINUTES, lat, lon).azimuth)}` : ""}
        </dd>
        <dt>Daylight</dt>
        <dd>{times.dayHours.toFixed(1)} hours</dd>
      </FactList>
      <p>
        {location.source === "zone"
          ? `Sun angles use an estimated location for zone ${location.zone}. Set your coordinates in the location settings for exact shadows.`
          : `Calculated for ${lat.toFixed(2)}°, ${lon.toFixed(2)}° (${location.place}).`}
      </p>
    </Card>
  );
}
