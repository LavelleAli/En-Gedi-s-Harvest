// A small turning ring for "working on it". Decorative: put the words next to it ("Searching…").
// It turns three times slower for readers who prefer reduced motion, rather than stopping, so it still
// says "busy".
export default function Spinner() {
  return (
    <span
      className="inline-block size-4 flex-none animate-spinner rounded-full border-2 border-line-strong border-t-green motion-reduce:[animation-duration:2.4s]"
      aria-hidden="true"
    />
  );
}
