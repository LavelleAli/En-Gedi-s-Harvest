// A window over the page (a modal <dialog>) that fades in and out over 500ms.
//   const { ref, open, close, onCancel, onClick } = useFadeDialog();
//   <Button onClick={open}>Change</Button>
//   <Dialog dialogRef={ref} onCancel={onCancel} onBackdropClick={onClick} titleId="loc-title">
//     <h2 id="loc-title">Your garden's location</h2> …
//   </Dialog>
// useFadeDialog (frontend/lib/useFadeDialog.ts) runs the fade, Esc and clicks on the dimmed backdrop;
// this component is the window's look. Windows are solid, not glass: they sit over everything.
import type { MouseEventHandler, ReactEventHandler, ReactNode, RefObject } from "react";
import { cx } from "@/frontend/lib/cx";

const DIALOG = [
  // A solid panel with rounded corners and a deep shadow.
  "rounded-lg border border-line bg-panel-solid p-6 text-fg shadow-raised",
  // Never taller than the screen; scrolls inside instead.
  "max-h-[min(90dvh,52rem)] overflow-auto",
  // Its heading is a step smaller than a page heading.
  "[&_h2]:text-xl",
  // Starts invisible: GSAP fades it in. The dimmed backdrop follows the fade through --shown.
  "opacity-0 backdrop:bg-[rgb(10_14_11/0.5)] backdrop:[opacity:var(--shown,1)]",
].join(" ");

type DialogProps = {
  dialogRef: RefObject<HTMLDialogElement | null>;
  onCancel: ReactEventHandler<HTMLDialogElement>; // from useFadeDialog: Esc fades it out
  onBackdropClick: MouseEventHandler<HTMLDialogElement>; // from useFadeDialog: a click outside closes it
  onClose?: ReactEventHandler<HTMLDialogElement>; // after it has closed
  titleId: string; // the id of the heading inside, which names the window
  wide?: boolean; // 48rem instead of 36rem, for maps and long forms
  children: ReactNode;
};

export default function Dialog({ dialogRef, onCancel, onBackdropClick, onClose, titleId, wide, children }: DialogProps) {
  return (
    <dialog
      ref={dialogRef}
      className={cx(DIALOG, wide ? "w-[min(48rem,calc(100%-2rem))]" : "w-[min(36rem,calc(100%-2rem))]")}
      aria-labelledby={titleId}
      onCancel={onCancel}
      onClick={onBackdropClick}
      onClose={onClose}
    >
      {children}
    </dialog>
  );
}
