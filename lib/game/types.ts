export type QuestStatus = "active" | "completed" | "abandoned";

export interface QuestProgress {
  status: QuestStatus;
  acceptedAt: string | null;
  completedAt: string | null;
}

export interface Progress {
  currentScene: string | null;
  visitedScenes: string[];
  discoveredEndings: string[];
  xp: number;
  capsEarned: number;
  capsSpent: number;
  inventory: string[];
  quests: Record<string, QuestProgress>;
  updatedAt: string | null;
}

export const DEFAULT_PROGRESS: Progress = {
  currentScene: null,
  visitedScenes: [],
  discoveredEndings: [],
  xp: 0,
  capsEarned: 0,
  capsSpent: 0,
  inventory: [],
  quests: {},
  updatedAt: null,
};
