// "Sun and shade", the panel over the sandbox's right half (beside Add to the yard): a date (or a quick pick: equinoxes, solstices,
// today), a time slider with the sun's height and direction and the day's sunrise and sunset, and the
// sun-hours map switch.
import Field from "@/frontend/components/ui/Field";
import { quickDates } from "../dates";
import { PANEL, SIDE_PANEL } from "../panelStyle";
import { formatClock, localToUtc, type SunTimes } from "../sun";
import { SELECT, SELECT_SMALL } from "./selectStyle";

const STEP_MINUTES = 15;

type SunControlsProps = {
  date: string; // "2026-06-21"
  today: string;
  onDate: (date: string | null) => void; // null means today
  minutes: number; // minutes after midnight, local time
  onMinutes: (minutes: number) => void;
  tz: string;
  times: SunTimes;
  sunLabel: string; // "Sun 37° up in the SSW"
  showHeat: boolean;
  onHeat: (on: boolean) => void;
};

export default function SunControls({ date, today, onDate, minutes, onMinutes, tz, times, sunLabel, showHeat, onHeat }: SunControlsProps) {
  const clock = formatClock(localToUtc(date, minutes, tz), tz);
  return (
    <section className={`${PANEL} ${SIDE_PANEL} [grid-area:sun]`} aria-label="Date and time for the sun" data-tour="planner-sun">
      <h3>Sun and shade</h3>
      <Field id="sun-date" label="Date">
        <input id="sun-date" type="date" value={date} onChange={(e) => e.target.value && onDate(e.target.value)} />
      </Field>
      <div className="flex flex-wrap gap-1" role="group" aria-label="Quick dates">
        {quickDates(date.slice(0, 4)).map(([label, d]) => (
          <button key={label} type="button" className={SELECT_SMALL} aria-pressed={date === d} onClick={() => onDate(d)}>
            {label}
          </button>
        ))}
        <button type="button" className={SELECT_SMALL} aria-pressed={date === today} onClick={() => onDate(null)}>
          Today
        </button>
      </div>
      <Field
        id="sun-time"
        label={
          <>
            Time: <b>{clock}</b> · {sunLabel}
          </>
        }
        hint={
          <>
            Sunrise {formatClock(times.sunrise, tz)} · sunset {formatClock(times.sunset, tz)} · {times.dayHours.toFixed(1)} hours of daylight
          </>
        }
      >
        <input
          id="sun-time"
          type="range"
          min={0}
          max={1425}
          step={STEP_MINUTES}
          value={minutes}
          onChange={(e) => onMinutes(Number(e.target.value))}
          aria-valuetext={clock}
          aria-describedby="sun-time-hint"
        />
      </Field>
      {/* Colors the yard by hours of direct sun on this date. */}
      <button type="button" className={`${SELECT} justify-self-start gap-1.5`} aria-pressed={showHeat} onClick={() => onHeat(!showHeat)}>
        {/* A small sun over a grid: the map colors the yard by hours of sun. */}
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="8" r="3" />
          <path d="M12 2v1M6.3 4.3l.7.7M17.7 4.3l-.7.7M3 15h18M3 20h18M8 13v9M16 13v9" />
        </svg>
        Sun-hours map
      </button>
    </section>
  );
}
