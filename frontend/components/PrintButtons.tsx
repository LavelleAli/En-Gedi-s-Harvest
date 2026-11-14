"use client";

// "Print this page" and "Whole book", in the masthead: see-through buttons with a hairline border.
import Button from "@/frontend/components/ui/Button";
import ButtonLink from "@/frontend/components/ui/ButtonLink";

export default function PrintButtons() {
  return (
    <div className="flex flex-wrap gap-2" data-tour="print">
      <Button variant="on-masthead" onClick={() => window.print()}>
        Print this page
      </Button>
      <ButtonLink variant="on-masthead" href="/book/">
        Whole book
      </ButtonLink>
    </div>
  );
}
