// One problem in the plant doctor: its name, a healthy plant beside the problem, the cause and the fix.
// Links from the encyclopedia point at its id (#sym-…); the linked card gets a focus-colored ring.
import CompareFrame from "./CompareFrame";

const CARD = [
  // Glass card.
  "grid content-start gap-3 rounded-lg border border-line bg-panel p-4 shadow-card backdrop-blur-glass",
  // A linked card: clear of the top of the window, and ringed.
  "scroll-mt-20 target:border-focus target:shadow-[0_0_0_3px_color-mix(in_srgb,var(--focus)_30%,transparent),var(--shadow-2)]",
  "print:break-inside-avoid",
].join(" ");

type Symptom = { t: string; ok: string; okT?: string; cause: string; fix: string };

type SymptomCardProps = {
  id: string; // the symptom's key, e.g. "rootrot"
  symptom: Symptom;
  healthySlot: string; // the photo slot of the healthy plant to compare with
  tour?: boolean; // the tour points at the first card
};

export default function SymptomCard({ id, symptom, healthySlot, tour }: SymptomCardProps) {
  return (
    <article className={CARD} id={`sym-${id}`} data-tour={tour ? "doctor" : undefined}>
      <h3>{symptom.t}</h3>
      <div className="grid grid-cols-2 gap-3">
        <CompareFrame slot={healthySlot} art={symptom.ok} alt="Healthy plant for comparison" caption={symptom.okT || "Healthy: even green, firm"} healthy />
        <CompareFrame slot={`sym-${id}`} art={id} alt={symptom.t} caption="Problem" healthy={false} />
      </div>
      <p>
        <b>Cause:</b> {symptom.cause}
      </p>
      <p>
        <b>Fix:</b> {symptom.fix}
      </p>
    </article>
  );
}
