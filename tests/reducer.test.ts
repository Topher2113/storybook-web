import { describe, expect, it } from "vitest";
import {
  ENDING_DISCOVERY_CAPS,
  capsBalance,
  gameReducer,
} from "@/lib/game/reducer";
import { DEFAULT_PROGRESS, type Progress } from "@/lib/game/types";

const base: Progress = { ...DEFAULT_PROGRESS };

function withQuest(
  state: Progress,
  questId: string,
  status: "active" | "completed" | "abandoned",
): Progress {
  return {
    ...state,
    quests: {
      ...state.quests,
      [questId]: { status, acceptedAt: "t0", completedAt: null },
    },
  };
}

describe("scene navigation", () => {
  it("records the current scene and marks it visited once", () => {
    let s = gameReducer(base, { type: "GOTO_SCENE", sceneId: "the-nest" });
    s = gameReducer(s, { type: "GOTO_SCENE", sceneId: "tunnel-a" });
    s = gameReducer(s, { type: "GOTO_SCENE", sceneId: "the-nest" });
    expect(s.currentScene).toBe("the-nest");
    expect(s.visitedScenes).toEqual(["the-nest", "tunnel-a"]);
  });
});

describe("ending discovery", () => {
  it("pays the exploration bounty for a new ending only", () => {
    let s = gameReducer(base, { type: "DISCOVER_ENDING", endingId: "grab-pizza" });
    expect(s.discoveredEndings).toEqual(["grab-pizza"]);
    expect(capsBalance(s)).toBe(ENDING_DISCOVERY_CAPS);
    s = gameReducer(s, { type: "DISCOVER_ENDING", endingId: "grab-pizza" });
    expect(capsBalance(s)).toBe(ENDING_DISCOVERY_CAPS);
    expect(s.xp).toBe(0);
  });
});

describe("quests", () => {
  it("completing an active quest pays XP and equal caps", () => {
    let s = gameReducer(base, { type: "ACCEPT_QUEST", questId: "scout-the-tunnels" });
    s = gameReducer(s, {
      type: "COMPLETE_QUEST",
      questId: "scout-the-tunnels",
      rewardXp: 15,
    });
    expect(s.quests["scout-the-tunnels"].status).toBe("completed");
    expect(s.xp).toBe(15);
    expect(capsBalance(s)).toBe(15);
  });

  it("cannot complete a quest that was never accepted", () => {
    const s = gameReducer(base, {
      type: "COMPLETE_QUEST",
      questId: "scout-the-tunnels",
      rewardXp: 15,
    });
    expect(s).toBe(base);
  });

  it("cannot complete the same quest twice", () => {
    let s = withQuest(base, "q", "active");
    s = gameReducer(s, { type: "COMPLETE_QUEST", questId: "q", rewardXp: 20 });
    const again = gameReducer(s, {
      type: "COMPLETE_QUEST",
      questId: "q",
      rewardXp: 20,
    });
    expect(again).toBe(s);
    expect(again.xp).toBe(20);
  });

  it("abandoning only works on an active quest and allows re-accepting", () => {
    let s = withQuest(base, "q", "active");
    s = gameReducer(s, { type: "ABANDON_QUEST", questId: "q" });
    expect(s.quests["q"].status).toBe("abandoned");
    const completedStays = gameReducer(withQuest(base, "q", "completed"), {
      type: "ABANDON_QUEST",
      questId: "q",
    });
    expect(completedStays.quests["q"].status).toBe("completed");
    s = gameReducer(s, { type: "ACCEPT_QUEST", questId: "q" });
    expect(s.quests["q"].status).toBe("active");
  });

  it("re-accepting an active or completed quest is a no-op", () => {
    const active = withQuest(base, "q", "active");
    expect(gameReducer(active, { type: "ACCEPT_QUEST", questId: "q" })).toBe(active);
    const completed = withQuest(base, "q", "completed");
    expect(gameReducer(completed, { type: "ACCEPT_QUEST", questId: "q" })).toBe(completed);
  });
});

describe("shop economy", () => {
  const funded: Progress = { ...base, capsEarned: 20 };

  it("buying deducts caps and adds the item", () => {
    const s = gameReducer(funded, { type: "BUY_ITEM", itemId: "glass-marble", price: 8 });
    expect(s.inventory).toEqual(["glass-marble"]);
    expect(capsBalance(s)).toBe(12);
  });

  it("cannot buy without enough caps", () => {
    const s = gameReducer(funded, { type: "BUY_ITEM", itemId: "glass-marble", price: 25 });
    expect(s).toBe(funded);
  });

  it("re-buying an owned item does not double-charge", () => {
    let s = gameReducer(funded, { type: "BUY_ITEM", itemId: "glass-marble", price: 8 });
    s = gameReducer(s, { type: "BUY_ITEM", itemId: "glass-marble", price: 8 });
    expect(capsBalance(s)).toBe(12);
    expect(s.inventory).toEqual(["glass-marble"]);
  });

  it("inventory is a set for pickups too", () => {
    let s = gameReducer(base, { type: "ADD_ITEM", itemId: "shiny-button" });
    s = gameReducer(s, { type: "ADD_ITEM", itemId: "shiny-button" });
    expect(s.inventory).toEqual(["shiny-button"]);
    s = gameReducer(s, { type: "REMOVE_ITEM", itemId: "shiny-button" });
    expect(s.inventory).toEqual([]);
  });
});

describe("RESET_RUN", () => {
  it("clears the current scene but preserves the meta-game", () => {
    let s = gameReducer(base, { type: "GOTO_SCENE", sceneId: "grab-pizza" });
    s = gameReducer(s, { type: "DISCOVER_ENDING", endingId: "grab-pizza" });
    s = withQuest(s, "q", "completed");
    s = { ...s, xp: 30, capsEarned: 45, capsSpent: 5, inventory: ["shiny-button"] };
    const reset = gameReducer(s, { type: "RESET_RUN" });
    expect(reset.currentScene).toBeNull();
    expect(reset.visitedScenes).toEqual(["grab-pizza"]);
    expect(reset.discoveredEndings).toEqual(["grab-pizza"]);
    expect(reset.xp).toBe(30);
    expect(capsBalance(reset)).toBe(40);
    expect(reset.inventory).toEqual(["shiny-button"]);
    expect(reset.quests["q"].status).toBe("completed");
  });
});

describe("APPLY_SERVER_STATE", () => {
  it("adopts the server scene and merges quest statuses", () => {
    const local = withQuest(
      gameReducer(base, { type: "GOTO_SCENE", sceneId: "the-nest" }),
      "local-q",
      "active",
    );
    const s = gameReducer(local, {
      type: "APPLY_SERVER_STATE",
      currentScene: "tunnel-a",
      inventory: ["fishbone-pick"],
      quests: { "server-q": { status: "completed", acceptedAt: "t", completedAt: "t" } },
    });
    expect(s.currentScene).toBe("tunnel-a");
    expect(s.visitedScenes).toContain("tunnel-a");
    expect(s.inventory).toEqual(["fishbone-pick"]);
    expect(s.quests["local-q"].status).toBe("active");
    expect(s.quests["server-q"].status).toBe("completed");
  });

  it("a null server scene leaves the local scene alone", () => {
    const local = gameReducer(base, { type: "GOTO_SCENE", sceneId: "the-nest" });
    const s = gameReducer(local, { type: "APPLY_SERVER_STATE", currentScene: null });
    expect(s.currentScene).toBe("the-nest");
  });
});
