import type { ReactNode } from "react";
import { Illo, type IllustrationName } from "./illustrations";
import { Blob, Note } from "./shapes";
import type { BlobName } from "./illustrations/paths";

/** Inner-page heading: a blob sits behind the heading only, with one drawing beside it. */
export function PageHeader({
  title,
  kicker,
  intro,
  illo,
  blob = "b",
  blobColor = "var(--butter)",
  children,
}: {
  title: ReactNode;
  kicker?: ReactNode;
  intro?: ReactNode;
  illo?: IllustrationName;
  blob?: BlobName;
  blobColor?: string;
  children?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div className="container page-header__inner">
        <div className="page-header__text">
          <Blob shape={blob} className="page-header__blob" color={blobColor} />
          {kicker ? <Note className="page-header__kicker">{kicker}</Note> : null}
          <h1>{title}</h1>
          {intro ? <p className="lead page-header__intro">{intro}</p> : null}
          {children}
        </div>
        {illo ? <Illo name={illo} className="page-header__illo deco--md" /> : null}
      </div>
    </header>
  );
}
