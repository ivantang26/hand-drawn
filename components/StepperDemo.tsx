"use client";

import { useState } from "react";
import { Stepper } from "./ui";

export function StepperDemo({ size = "md" }: { size?: "md" | "lg" }) {
  const [v, setV] = useState(2);
  return <Stepper value={v} onChange={setV} max={9} label="Country loaf" size={size} />;
}
