import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

// False during SSR and the hydration render, true immediately after — the
// lint-clean way to gate client-only state (localStorage-backed progress)
// without a setState-in-effect.
export function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
