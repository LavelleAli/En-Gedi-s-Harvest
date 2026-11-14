"use client";

// The profile: who's signed in, where the garden is, and what's saved on this device (and whether
// it syncs). Works signed out too, since everything here also lives in this browser.
import { useAuth } from "@/frontend/account/auth";
import ButtonLink from "@/frontend/components/ui/ButtonLink";
import Card from "@/frontend/components/ui/Card";
import FactList from "@/frontend/components/ui/FactList";
import SectionHeader from "@/frontend/components/ui/SectionHeader";
import { useLocation } from "@/frontend/lib/location";
import CardRow from "../account/CardRow";
import { useSavedCounts } from "./useSavedCounts";
import Page from "@/frontend/components/ui/Page";

const CARD = "grid content-start gap-4";

export default function ProfilePage() {
  const { status, user } = useAuth();
  const location = useLocation();
  const saved = useSavedCounts();
  const signedIn = status === "signed-in" && user !== null;
  const exactCoords = location.source === "device" || location.source === "manual";

  return (
    <Page>
      <SectionHeader kicker="You" title="Profile" />

      <CardRow>
        <Card as="section" className={CARD} aria-labelledby="who-title">
          <h3 id="who-title">{signedIn ? user?.name || "Signed in" : "Not signed in"}</h3>
          <p>
            {signedIn
              ? user?.email
              : status === "disabled"
                ? "Accounts aren't turned on in this copy of the site."
                : "Sign in to keep your saved things on all your devices."}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <ButtonLink href="/account/">{signedIn ? "Account and plans" : "Sign in"}</ButtonLink>
          </div>
        </Card>

        <Card as="section" className={CARD} aria-labelledby="garden-title">
          <h3 id="garden-title">Your garden</h3>
          <FactList>
            <dt>Place</dt>
            <dd>{location.place}</dd>
            <dt>Zone</dt>
            <dd>{location.zone}</dd>
            <dt>Sun angles</dt>
            <dd>{exactCoords ? "From your coordinates" : "Estimated from your area"}</dd>
          </FactList>
          <p>Change it with the location button at the top of the page.</p>
        </Card>
      </CardRow>

      <Card as="section" className={CARD} aria-labelledby="saved-title">
        <h3 id="saved-title">Saved on this device</h3>
        {saved ? (
          <FactList>
            {saved.map((s) => (
              // display: contents keeps each label and value in the list's two-column grid.
              <div key={s.label} className="contents">
                <dt>{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </FactList>
        ) : (
          <p>Counting…</p>
        )}
        <p>
          {signedIn
            ? "These sync to your account and follow you to your other devices. Your location and light/dark setting stay on each device."
            : "These are saved only in this browser. Sign in to sync them to your other devices."}
        </p>
      </Card>
    </Page>
  );
}
