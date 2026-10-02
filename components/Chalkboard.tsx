import type { Special } from "@/lib/types";

/** Dark board with handwritten specials. The writing is real text in Caveat; prices stay in DM Sans. */
export function Chalkboard({ specials, title = "On the board today" }: { specials: Special[]; title?: string }) {
  const today = specials.filter((s) => s.kind === "today");
  const seasonal = specials.filter((s) => s.kind === "seasonal");
  return (
    <div className="chalkboard">
      <div className="chalkboard__inner">
        <h3 className="chalkboard__title">{title}</h3>
        <ul className="chalk-list">
          {today.map((s) => (
            <li key={s.id} className="chalk-item">
              <span className="chalk-item__text">
                <span className="chalk-item__name">{s.title}</span>
                {s.detail ? <span className="chalk-item__detail">{s.detail}</span> : null}
              </span>
              {s.price ? (
                <>
                  <span className="chalk-item__leader" aria-hidden="true" />
                  <span className="chalk-item__price price">{s.price}</span>
                </>
              ) : null}
            </li>
          ))}
        </ul>
        {seasonal.length ? (
          <>
            <h3 className="chalkboard__title chalkboard__title--small">Seasonal bakes</h3>
            <ul className="chalk-list">
              {seasonal.map((s) => (
                <li key={s.id} className="chalk-item">
                  <span className="chalk-item__text">
                    <span className="chalk-item__name">{s.title}</span>
                    {s.detail ? <span className="chalk-item__detail">{s.detail}</span> : null}
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : null}
        <svg className="chalkboard__doodle" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
          <use href="#i-croissant" />
        </svg>
      </div>
    </div>
  );
}
