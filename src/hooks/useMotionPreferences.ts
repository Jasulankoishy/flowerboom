import { useSyncExternalStore } from "react";
import { useReducedMotion } from "motion/react";

const desktopQuery = "(min-width: 1024px) and (hover: hover) and (pointer: fine)";

function subscribe(callback: () => void) {
  const query = window.matchMedia(desktopQuery);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

export function useMotionPreferences() {
  const isDesktop = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(desktopQuery).matches,
    () => false,
  );
  const reducedMotion = useReducedMotion() === true;
  return { isDesktop, reducedMotion };
}
