"use client";

// Opens and closes a <dialog> with a 500ms fade (GSAP; timing and easing in frontend/lib/motion.js).
// A plain dialog.close() vanishes instantly, so closing first fades the window out and only calls
// close() once the fade has finished. The dimmed backdrop fades with it through the --shown
// variable (0 to 1), which globals.css reads in .fade-dialog::backdrop.
// While open, the dialog also carries the class "is-shown".
//
//   const { ref, open, close, onCancel, onClick } = useFadeDialog();
//   <button onClick={open}>…</button>
//   <dialog ref={ref} className="dialog fade-dialog" onCancel={onCancel} onClick={onClick}>…</dialog>
// Destructure it like this: React's lint rules treat the whole object as a ref and refuse fade.close.
import { useCallback, useEffect, useRef } from "react";
import { EASE, FADE, duration, gsap } from "@/frontend/lib/motion";

export const FADE_MS = FADE * 1000;

export function useFadeDialog({ onClosed } = {}) {
  const ref = useRef(null);
  const tween = useRef(null);
  const closedCallback = useRef(onClosed);
  useEffect(() => {
    closedCallback.current = onClosed;
  }, [onClosed]);
  useEffect(() => () => tween.current?.kill(), []);

  const open = useCallback(() => {
    const dialog = ref.current;
    if (!dialog) return;
    tween.current?.kill();
    if (!dialog.open) dialog.showModal();
    dialog.classList.add("is-shown");
    tween.current = gsap.fromTo(
      dialog,
      { opacity: 0, y: 8, "--shown": 0 },
      { opacity: 1, y: 0, "--shown": 1, duration: duration(FADE), ease: EASE },
    );
  }, []);

  const close = useCallback(() => {
    const dialog = ref.current;
    if (!dialog?.open) return;
    tween.current?.kill();
    dialog.classList.remove("is-shown");
    tween.current = gsap.to(dialog, {
      opacity: 0,
      y: 8,
      "--shown": 0,
      duration: duration(FADE),
      ease: EASE,
      onComplete: () => {
        dialog.close();
        closedCallback.current?.();
      },
    });
  }, []);

  // The Escape key fires "cancel"; stop the instant close and fade out instead.
  const onCancel = useCallback(
    (e) => {
      e.preventDefault();
      close();
    },
    [close],
  );

  // Clicking the dimmed area outside the dialog box closes it too. (A click on the backdrop reports
  // the dialog itself as its target, so check the click landed outside the box.)
  const onClick = useCallback(
    (e) => {
      const dialog = ref.current;
      if (e.target !== dialog) return;
      const r = dialog.getBoundingClientRect();
      const outside = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      if (outside) close();
    },
    [close],
  );

  return { ref, open, close, onCancel, onClick };
}
