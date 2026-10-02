"use client";

import { useId, useState } from "react";
import { Illo, type IllustrationName } from "./illustrations";
import { Button } from "./ui";
import type { ApiError } from "@/lib/types";

export type EnquiryField = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "textarea" | "select";
  options?: string[];
  required?: boolean;
  hint?: string;
  autoComplete?: string;
  wide?: boolean;
};

/** Wholesale and contact forms: client and server validation, a friendly thank-you. */
export function EnquiryForm({
  kind,
  fields,
  submitLabel,
  thanks,
  illo = "bag",
}: {
  kind: "wholesale" | "contact";
  fields: EnquiryField[];
  submitLabel: string;
  thanks: string;
  illo?: IllustrationName;
}) {
  const uid = useId();
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  const validate = () => {
    const e: Record<string, string> = {};
    for (const f of fields) {
      const v = (values[f.name] ?? "").trim();
      if (f.required && !v) e[f.name] = "Please fill in this field.";
      else if (f.type === "email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) e[f.name] = "Check the email address.";
    }
    return e;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    setServerError(null);
    const first = Object.keys(e)[0];
    if (first) {
      document.getElementById(`${uid}-${first}`)?.focus();
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, fields: values }),
      });
      const data = await res.json();
      if (!res.ok) {
        const err = data as ApiError;
        if (err.field) setErrors({ [err.field]: err.error });
        else setServerError(err.error);
      } else setDone(data.id);
    } catch {
      setServerError("We couldn't send that just now. Please try again, or give us a ring.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="thanks" role="status">
        <Illo name={illo} size={80} />
        <h2>Thank you!</h2>
        <p>{thanks}</p>
        <p className="small muted">Reference {done}</p>
      </div>
    );
  }

  return (
    <form className="enquiry" onSubmit={submit} noValidate>
      <div className="form-grid form-grid--2">
        {fields.map((f) => {
          const id = `${uid}-${f.name}`;
          const err = errors[f.name];
          const describedBy = [f.hint ? `${id}-hint` : "", err ? `${id}-err` : ""].filter(Boolean).join(" ") || undefined;
          const common = {
            id,
            name: f.name,
            required: f.required,
            value: values[f.name] ?? "",
            "aria-invalid": err ? true : undefined,
            "aria-describedby": describedBy,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
              setValues((v) => ({ ...v, [f.name]: e.target.value })),
          };
          return (
            <div key={f.name} className={`field${f.wide || f.type === "textarea" ? " span-2" : ""}`}>
              <label htmlFor={id}>
                {f.label}
                {!f.required ? <span className="muted"> (optional)</span> : null}
              </label>
              {f.type === "textarea" ? (
                <textarea {...common} maxLength={1000} />
              ) : f.type === "select" ? (
                <select {...common}>
                  <option value="">Choose…</option>
                  {f.options?.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              ) : (
                <input {...common} type={f.type ?? "text"} autoComplete={f.autoComplete} />
              )}
              {f.hint ? (
                <p className="field__hint" id={`${id}-hint`}>
                  {f.hint}
                </p>
              ) : null}
              {err ? (
                <p className="field__error" id={`${id}-err`}>
                  {err}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
      {serverError ? (
        <p className="form-error" role="alert">
          {serverError}
        </p>
      ) : null}
      <Button type="submit" busy={busy} disabled={busy} arrow>
        {busy ? "Sending…" : submitLabel}
      </Button>
    </form>
  );
}
