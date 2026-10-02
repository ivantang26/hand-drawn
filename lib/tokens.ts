/** Wildroot colour tokens. Mirrors the :root custom properties in app/globals.css. */
export const colours = {
  flour: "#F7F1E5",
  crust: "#8B5A2B",
  rye: "#3E2C1C",
  sage: "#8FA37E",
  terracotta: "#C9694A",
  butter: "#F2D58A",
  oat: "#E7DCC6",
  // Supporting tones derived from the core seven.
  chalkboard: "#232B26",
  chalk: "#F3EEDF",
  sageTint: "#DCE3D2",
  terracottaTint: "#F1D5C8",
  soldOutTint: "#E4E0D8",
  ryeSoft: "#6A5541",
} as const;

export type ColourToken = keyof typeof colours;
