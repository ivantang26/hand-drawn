/**
 * "Adding to basket": the product's illustration hops into the basket icon (300ms).
 * Skipped entirely for reduced motion; the basket count still updates.
 */
export function hopToBasket(from: Element | null) {
  if (!from || typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-basket-target]"));
  const target = targets.find((t) => t.offsetParent !== null && t.getBoundingClientRect().width > 0);
  if (!target) return;

  const a = from.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const clone = from.cloneNode(true) as HTMLElement;
  const size = Math.min(a.width, 56);
  Object.assign(clone.style, {
    position: "fixed",
    left: `${a.left + a.width / 2 - size / 2}px`,
    top: `${a.top + a.height / 2 - size / 2}px`,
    width: `${size}px`,
    height: `${size}px`,
    margin: "0",
    zIndex: "1000",
    pointerEvents: "none",
    color: "var(--crust)",
  });
  clone.setAttribute("aria-hidden", "true");
  document.body.appendChild(clone);

  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  const lift = Math.min(-60, dy / 2 - 60);
  const anim = clone.animate(
    [
      { transform: "translate(0, 0) scale(1) rotate(0deg)", opacity: 1 },
      { transform: `translate(${dx * 0.5}px, ${lift}px) scale(0.8) rotate(-12deg)`, opacity: 1, offset: 0.45 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.3) rotate(8deg)`, opacity: 0.2 },
    ],
    { duration: 300, easing: "cubic-bezier(.3,.7,.4,1)" },
  );
  anim.onfinish = () => {
    clone.remove();
    target.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.18) rotate(-6deg)" }, { transform: "scale(1)" }],
      { duration: 220, easing: "ease-out" },
    );
  };
}
