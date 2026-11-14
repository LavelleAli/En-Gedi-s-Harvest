import ButtonLink from "@/frontend/components/ui/ButtonLink";
import SectionHeader from "@/frontend/components/ui/SectionHeader";
import Page from "@/frontend/components/ui/Page";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <Page>
      <SectionHeader
        kicker="404"
        title={<>That page isn&apos;t in the book</>}
        lead={<>The link may be old or mistyped. Pick a section from the row above, or start with this month&apos;s garden tasks.</>}
      />
      <p>
        <ButtonLink href="/">Go to this month</ButtonLink>
      </p>
    </Page>
  );
}
