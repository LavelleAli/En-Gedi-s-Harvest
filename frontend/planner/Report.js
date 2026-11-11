"use client";

// The garden report under the 3D view: the sun on the chosen day, then each bed's light, companions,
// planting steps and watering, and a week-at-a-glance watering schedule.
import { bedCrops, companionReport, plantCount, plantingNotes, sunFit, wateringPlan } from "@/frontend/planner/analysis";
import { bedSunHours, lightClass } from "@/frontend/planner/shade";
import { compassPoint, formatClock, sunPosition } from "@/frontend/planner/sun";
import { KIND_LABEL } from "@/shared/crop";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const FIT_LABEL = { good: "Good light", ok: "Part shade OK", poor: "Too shady" };

function SunCard({ times, location, date }) {
  const noon = sunPosition(times.solarNoon, location.lat, location.lon);
  const nice = new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" });
  return (
    <div className="card stack-sm">
      <h3>Sun on {nice}</h3>
      <dl className="kv">
        <dt>Sunrise</dt><dd>{formatClock(times.sunrise, location.tz)}{times.sunrise ? ` in the ${compassPoint(sunPosition(times.sunrise + 600000, location.lat, location.lon).azimuth)}` : ""}</dd>
        <dt>Highest</dt><dd>{formatClock(times.solarNoon, location.tz)}, {Math.max(0, Math.round(noon.altitude))}° up in the {compassPoint(noon.azimuth)}</dd>
        <dt>Sunset</dt><dd>{formatClock(times.sunset, location.tz)}{times.sunset ? ` in the ${compassPoint(sunPosition(times.sunset - 600000, location.lat, location.lon).azimuth)}` : ""}</dd>
        <dt>Daylight</dt><dd>{times.dayHours.toFixed(1)} hours</dd>
      </dl>
      <p className="pmeta">
        {location.source === "zone"
          ? `Sun angles use an estimated location for zone ${location.zone}. Set your coordinates in the location settings for exact shadows.`
          : `Calculated for ${location.lat.toFixed(2)}°, ${location.lon.toFixed(2)}° (${location.place}).`}
      </p>
    </div>
  );
}

function BedCard({ bed, cropsById, crops, grid, companions, zone, month, onSelect }) {
  const inBed = bedCrops(bed, cropsById);
  const sun = bedSunHours(bed, grid);
  const light = lightClass(sun.avg);
  const water = wateringPlan(bed, inBed, month, zone);
  const pairs = companions[bed.id];
  return (
    <article className="card bed-card stack" aria-labelledby={`bed-${bed.id}`}>
      <header className="bed-card-head">
        <div>
          <h3 id={`bed-${bed.id}`}>{bed.name}</h3>
          <p className="pmeta">
            {bed.type === "raised" ? `Raised bed, ${Math.round(bed.h * 12)} in deep` : "In-ground bed"} · {bed.w} × {bed.d} ft ({Math.round(bed.w * bed.d)} sq ft)
          </p>
        </div>
        <span className={`light-badge ${light.id}`}>{light.label} · {sun.avg.toFixed(1)} h</span>
      </header>
      {inBed.length === 0 ? (
        <p>No crops yet. <button type="button" className="link-button" onClick={() => onSelect(bed.id)}>Select this bed</button> to add some.</p>
      ) : (
        <ul className="crop-reports">
          {inBed.map((crop) => {
            const fit = sunFit(sun.avg, crop);
            return (
              <li key={crop.id} className="stack-sm">
                <div className="crop-report-head">
                  <b>{crop.name}</b>
                  <span className="pmeta">{KIND_LABEL[crop.kind]} · about {plantCount(bed, crop, inBed.length)} plants · {crop.spacingIn} in apart</span>
                  <span className={`fit-badge ${fit.level}`} title={fit.text}>{FIT_LABEL[fit.level]}</span>
                </div>
                {fit.level !== "good" && <p className="pmeta">{fit.text}.</p>}
                <ul className="notes">
                  {plantingNotes(crop, bed, zone).map((n) => <li key={n}>{n}</li>)}
                  <li>{crop.how}</li>
                  {crop.zoneNote && <li>Zone note: {crop.zoneNote}</li>}
                </ul>
              </li>
            );
          })}
        </ul>
      )}
      {(pairs.good.length > 0 || pairs.bad.length > 0 || pairs.nearby.length > 0) && (
        <div className="stack-sm">
          <h4>Companions</h4>
          <ul className="companions">
            {pairs.good.map(([a, b]) => <li key={`g-${a.id}-${b.id}`} className="good"><span aria-hidden="true">✓</span> {a.name} and {b.name} grow well together</li>)}
            {pairs.bad.map(([a, b]) => <li key={`b-${a.id}-${b.id}`} className="bad"><span aria-hidden="true">✗</span> {a.name} and {b.name} shouldn&apos;t share a bed</li>)}
            {pairs.nearby.map(({ a, b, bed: other }) => (
              <li key={`n-${a.id}-${b.id}-${other.id}`} className="bad"><span aria-hidden="true">!</span> {a.name} is close to {b.name} in {other.name}; keep them farther apart</li>
            ))}
          </ul>
        </div>
      )}
      {water && (
        <div className="stack-sm">
          <h4>Watering</h4>
          <p>{water.text}</p>
        </div>
      )}
    </article>
  );
}

export default function GardenReport({ garden, crops, cropsById, grid, times, date, location, customCrops, onRemoveCrop, onSelect }) {
  const month = Number(date.slice(5, 7)) - 1;
  const companions = companionReport(garden.beds, cropsById, crops);
  const plans = garden.beds.map((bed) => [bed, wateringPlan(bed, bedCrops(bed, cropsById), month, location.zone)]);
  const monthName = new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", timeZone: "UTC" });
  return (
    <section className="stack-lg planner-report" aria-labelledby="report-title">
      <h2 id="report-title" className="report-title">Garden report</h2>
      <div className="report-top">
        <SunCard times={times} location={location} date={date} />
        <div className="card stack-sm">
          <h3>Watering schedule for {monthName}</h3>
          {plans.some(([, p]) => p && !p.dormant) ? (
            <div className="tbl">
              <table className="water-table">
                <caption className="sr-only">Gallons of water per bed for each day of the week</caption>
                <thead><tr><th scope="col">Bed</th>{DAYS.map((d) => <th key={d} scope="col">{d}</th>)}</tr></thead>
                <tbody>
                  {plans.filter(([, p]) => p && !p.dormant).map(([bed, p]) => (
                    <tr key={bed.id}>
                      <th scope="row">{bed.name}</th>
                      {DAYS.map((d) => <td key={d}>{p.days.includes(d) ? <span className="water-drop">{p.gallonsPerSession} gal</span> : <span aria-label="no watering">·</span>}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="pmeta">{plans.find(([, p]) => p?.dormant)?.[1].text || "Add crops to your beds to get a schedule."}</p>
          )}
          <p className="hint">Amounts count rain: skip a day after a soaking rain of ½ in or more. Check by pushing a finger 2 in into the soil.</p>
        </div>
      </div>
      {garden.beds.length === 0 && <p className="callout b"><strong>No beds yet</strong> Use “+ Raised bed” or “+ In-ground bed” above to start.</p>}
      <div className="bed-cards">
        {garden.beds.map((bed) => (
          <BedCard key={bed.id} bed={bed} cropsById={cropsById} crops={crops} grid={grid} companions={companions} zone={location.zone} month={month} onSelect={onSelect} />
        ))}
      </div>
      {customCrops.length > 0 && (
        <div className="card stack-sm">
          <h3>Crops you added</h3>
          <ul className="item-list">
            {customCrops.map((c) => (
              <li key={c.id}>
                <span><b>{c.name}</b> <span className="pmeta">{c.origin === "research" ? "researched" : "entered by hand"}</span></span>
                {c.sources?.length > 0 && (
                  <span className="pmeta">Sources: {c.sources.map((s, i) => (
                    <span key={s.url}>{i ? ", " : ""}<a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a></span>
                  ))}</span>
                )}
                <button type="button" className="link-button" onClick={() => onRemoveCrop(c.id)} aria-label={`Remove ${c.name} from your crops`}>Remove</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
