import { useEffect, useRef } from "react";

/**
 * useClickOutside
 * - Closes on outside pointerdown (capture) so React onClick races don't break it
 * - Optional: close on Escape, visibility change, blur, and route changes
 */
export function useClickOutside({
  refs,                 // array of refs to treat as "inside"
  onOutside,            // () => void
  enabled = true,
  closeOnEsc = true,
  closeOnBlur = true,
  closeOnHide = true,
  routeKey,             // e.g. useLocation().key (RR) or usePathname() (Next)
}) {
  // keep latest handler without re-subscribing
  const latest = useRef(onOutside);
  useEffect(() => { latest.current = onOutside; }, [onOutside]);

  useEffect(() => {
    if (!enabled) return;

    const isInside = (target) =>
      refs.some((r) => {
        const el = r?.current;
        return el && (el === target || el.contains(target));
      });

    // capture so this fires before React onClick
    const onPointerDown = (e) => {
      const target = e.target;
      if (isInside(target)) return;
      latest.current?.();
    };

    const onKey = (e) => {
      if (closeOnEsc && e.key === "Escape") latest.current?.();
    };

    const onVisibility = () => {
      if (closeOnHide && document.hidden) latest.current?.();
    };

    const onWindowBlur = () => {
      if (closeOnBlur) latest.current?.();
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onWindowBlur);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onWindowBlur);
    };
  }, [refs, enabled, closeOnEsc, closeOnBlur, closeOnHide]);

  // Close on route change
  useEffect(() => {
    if (routeKey == null) return;
    latest.current?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeKey]);
}
