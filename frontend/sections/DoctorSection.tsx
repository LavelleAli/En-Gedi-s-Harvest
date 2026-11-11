import { SYM } from "@/frontend/data/art";
import { OK_SLOT } from "@/frontend/data/healthy";
import { Art, Credit, getPhoto } from "@/frontend/components/Photo";
import Reveal from "@/frontend/components/Reveal";

function Frame({ slot, art, alt, caption, tone }: { slot: string; art: string; alt: string; caption: string; tone: string }) {
  const photo = getPhoto(slot);
  return (
    <figure>
      <div className="frame">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo.file} alt={alt} loading="lazy" />
        ) : (
          <Art name={art} />
        )}
      </div>
      <figcaption className={tone}>{caption}</figcaption>
      {photo && <Credit photo={photo} />}
    </figure>
  );
}

export default function DoctorSection() {
  return (
    <section className="view">
      <div>
        <div className="kicker">Healthy vs. unhealthy</div>
        <h2>Plant doctor</h2>
      </div>
      <p className="lead">
        Each card puts a healthy plant next to a common problem so you can match what you see. Photos come from Wikimedia Commons; where a
        photo is missing, a drawing shows the pattern. For a firm diagnosis, bring a sample to the{" "}
        local cooperative extension office (in the US, the <a href="https://www.nifa.usda.gov/land-grant-colleges-and-universities-partner-website-directory" target="_blank" rel="noopener noreferrer">land-grant university</a> for your state; in Fulton County, Georgia, the <a href="https://extension.uga.edu/county-offices/fulton.html" target="_blank" rel="noopener noreferrer">UGA Extension office</a>).
      </p>
      <Reveal className="docgrid">
        {Object.entries(SYM).map(([key, s]) => (
          <article className="doc" id={`sym-${key}`} key={key}>
            <h3>{s.t}</h3>
            <div className="cmp">
              <Frame slot={OK_SLOT[s.ok]} art={s.ok} alt="Healthy plant for comparison" caption={s.okT || "Healthy: even green, firm"} tone="ok" />
              <Frame slot={`sym-${key}`} art={key} alt={s.t} caption="Problem" tone="bad" />
            </div>
            <p><b>Cause:</b> {s.cause}</p>
            <p><b>Fix:</b> {s.fix}</p>
          </article>
        ))}
      </Reveal>
      <div className="packet k">
        <header><h3>Quick checkup, once a week</h3></header>
        <div className="body">
          <ol className="steps">
            <li>Look under leaves, where most pests hide.</li>
            <li>Compare new top growth with older lower leaves. Problems that start low are often feeding or water; problems that start high are often pests or disease.</li>
            <li>Push a finger 2 inches into the soil. Dry means water; soggy clay means stop watering and improve drainage.</li>
            <li>Pull and bag any badly diseased leaves. Don&apos;t compost them.</li>
            <li>Water the soil, not the leaves, and water in the morning so foliage dries by evening.</li>
          </ol>
        </div>
      </div>
    </section>
  );
}
