"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
} from "react";
import { listQuests } from "@/lib/api/quests";
import type { Quest } from "@/lib/api/types";
import { gameReducer, type GameAction } from "@/lib/game/reducer";
import { loadProgress, saveProgress } from "@/lib/game/storage";
import { DEFAULT_PROGRESS, type Progress } from "@/lib/game/types";
import { useHydrated } from "@/lib/useHydrated";

interface GameContextValue {
  progress: Progress;
  dispatch: Dispatch<GameAction>;
  hydrated: boolean;
  questCatalog: Quest[];
  // Lazily fetches the quest catalog once; safe to call from any screen that
  // needs quest metadata (npc offers, target scenes, rewards).
  ensureQuestCatalog: () => Promise<Quest[]>;
}

const GameContext = createContext<GameContextValue>({
  progress: DEFAULT_PROGRESS,
  dispatch: () => {},
  hydrated: false,
  questCatalog: [],
  ensureQuestCatalog: async () => [],
});

export function useGame() {
  return useContext(GameContext);
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [progress, dispatch] = useReducer(gameReducer, DEFAULT_PROGRESS);
  const hydrated = useHydrated();
  const [questCatalog, setQuestCatalog] = useState<Quest[]>([]);
  const catalogPromise = useRef<Promise<Quest[]> | null>(null);
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    dispatch({ type: "HYDRATE", progress: loadProgress() });
  }, []);

  // Debounced persistence — never before hydration, or defaults would
  // clobber a real save.
  useEffect(() => {
    if (!hydrated) return;
    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => saveProgress(progress), 300);
    return () => {
      if (persistTimer.current) clearTimeout(persistTimer.current);
    };
  }, [progress, hydrated]);

  const ensureQuestCatalog = useCallback(() => {
    if (!catalogPromise.current) {
      catalogPromise.current = listQuests()
        .then((res) => {
          setQuestCatalog(res.quests);
          return res.quests;
        })
        .catch((err) => {
          catalogPromise.current = null; // allow retry on next call
          throw err;
        });
    }
    return catalogPromise.current;
  }, []);

  return (
    <GameContext.Provider
      value={{ progress, dispatch, hydrated, questCatalog, ensureQuestCatalog }}
    >
      {children}
    </GameContext.Provider>
  );
}
