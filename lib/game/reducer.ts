// The pure heart of the game layer. The API has no wallet, XP total, or
// discovery tracking, so the web app layers a client-side economy on top:
//
//   - Completing a quest pays its reward_xp as XP *and* the same number of
//     bottle caps ("the Pizza Kingdom pays by the whisker" — 1 XP = 1 cap).
//   - Discovering an ending you haven't seen before pays a flat 15-cap
//     exploration bounty (no XP), so guests who skip quests still get a
//     shop budget.
//   - Buying spends caps. Balance is always derived (earned − spent) and
//     never stored, so it cannot drift.
//
// Play Again (RESET_RUN) only clears the current scene: XP, caps, inventory,
// visited scenes, and discovered endings persist across runs — that's the
// collectible meta-game.
import {
  DEFAULT_PROGRESS,
  type Progress,
  type QuestStatus,
} from "./types";

export const ENDING_DISCOVERY_CAPS = 15;

export type GameAction =
  | { type: "HYDRATE"; progress: Progress }
  | { type: "GOTO_SCENE"; sceneId: string; at?: string }
  | { type: "DISCOVER_ENDING"; endingId: string; at?: string }
  | { type: "ACCEPT_QUEST"; questId: string; at?: string }
  | { type: "COMPLETE_QUEST"; questId: string; rewardXp: number; at?: string }
  | { type: "ABANDON_QUEST"; questId: string }
  | { type: "ADD_ITEM"; itemId: string }
  | { type: "REMOVE_ITEM"; itemId: string }
  | { type: "BUY_ITEM"; itemId: string; price: number; at?: string }
  | { type: "RESET_RUN" }
  | {
      type: "APPLY_SERVER_STATE";
      currentScene?: string | null;
      inventory?: string[];
      quests?: Record<string, { status: QuestStatus; acceptedAt: string | null; completedAt: string | null }>;
    };

function now(at?: string) {
  return at ?? new Date().toISOString();
}

export function capsBalance(p: Progress): number {
  return p.capsEarned - p.capsSpent;
}

export function gameReducer(state: Progress, action: GameAction): Progress {
  switch (action.type) {
    case "HYDRATE":
      return action.progress;

    case "GOTO_SCENE": {
      const at = now(action.at);
      const visitedScenes = state.visitedScenes.includes(action.sceneId)
        ? state.visitedScenes
        : [...state.visitedScenes, action.sceneId];
      return { ...state, currentScene: action.sceneId, visitedScenes, updatedAt: at };
    }

    case "DISCOVER_ENDING": {
      if (state.discoveredEndings.includes(action.endingId)) return state;
      return {
        ...state,
        discoveredEndings: [...state.discoveredEndings, action.endingId],
        capsEarned: state.capsEarned + ENDING_DISCOVERY_CAPS,
        updatedAt: now(action.at),
      };
    }

    case "ACCEPT_QUEST": {
      const existing = state.quests[action.questId];
      if (existing?.status === "active" || existing?.status === "completed") {
        return state;
      }
      const at = now(action.at);
      return {
        ...state,
        quests: {
          ...state.quests,
          [action.questId]: { status: "active", acceptedAt: at, completedAt: null },
        },
        updatedAt: at,
      };
    }

    case "COMPLETE_QUEST": {
      const quest = state.quests[action.questId];
      if (!quest || quest.status !== "active") return state;
      const at = now(action.at);
      return {
        ...state,
        xp: state.xp + action.rewardXp,
        capsEarned: state.capsEarned + action.rewardXp,
        quests: {
          ...state.quests,
          [action.questId]: { ...quest, status: "completed", completedAt: at },
        },
        updatedAt: at,
      };
    }

    case "ABANDON_QUEST": {
      const quest = state.quests[action.questId];
      if (!quest || quest.status !== "active") return state;
      return {
        ...state,
        quests: {
          ...state.quests,
          [action.questId]: { ...quest, status: "abandoned" },
        },
        updatedAt: now(),
      };
    }

    case "ADD_ITEM": {
      if (state.inventory.includes(action.itemId)) return state;
      return {
        ...state,
        inventory: [...state.inventory, action.itemId],
        updatedAt: now(),
      };
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        inventory: state.inventory.filter((id) => id !== action.itemId),
        updatedAt: now(),
      };

    case "BUY_ITEM": {
      // Owning is a set: re-buying something you hold is a no-op, not a charge.
      if (state.inventory.includes(action.itemId)) return state;
      if (capsBalance(state) < action.price) return state;
      return {
        ...state,
        inventory: [...state.inventory, action.itemId],
        capsSpent: state.capsSpent + action.price,
        updatedAt: now(action.at),
      };
    }

    case "RESET_RUN":
      return { ...state, currentScene: null, updatedAt: now() };

    case "APPLY_SERVER_STATE": {
      const next = { ...state };
      if (action.currentScene !== undefined && action.currentScene !== null) {
        next.currentScene = action.currentScene;
        if (!next.visitedScenes.includes(action.currentScene)) {
          next.visitedScenes = [...next.visitedScenes, action.currentScene];
        }
      }
      if (action.inventory) next.inventory = action.inventory;
      if (action.quests) next.quests = { ...next.quests, ...action.quests };
      next.updatedAt = now();
      return next;
    }

    default:
      return state;
  }
}

export { DEFAULT_PROGRESS };
