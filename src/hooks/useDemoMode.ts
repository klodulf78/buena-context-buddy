import { useLocation } from "react-router-dom";

/**
 * Returns true when the URL has `?mode=demo`. Used to hide the nav and lock
 * the race UI into a clean, deterministic recording surface.
 */
export function useDemoMode(): boolean {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  return params.get("mode") === "demo";
}