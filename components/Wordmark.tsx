import { Illo } from "./illustrations";

/** Hand-drawn wordmark: a wheat sprig and the name set in soft Fraunces with a looping underline. */
export function Wordmark({ tone = "ink" }: { tone?: "ink" | "flour" }) {
  return (
    <span className={`wordmark wordmark--${tone}`}>
      <Illo name="wheat" className="wordmark__wheat" />
      <span className="wordmark__text">Wildroot</span>
      <svg className="wordmark__swash" viewBox="0 0 120 12" aria-hidden="true" focusable="false">
        <path d="M3 7 C24 3.5 52 3 78 5.5 C92 7 104 8.5 117 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
    </span>
  );
}
