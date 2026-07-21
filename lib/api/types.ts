// Response shapes for every Storybook API endpoint, mirroring the live
// contract exactly (field names come from the server; note the quirks:
// /api/shops returns a bare array, scene-list `choices` is an integer count
// while scene-detail `choices` is an array, and endings use `name` where a
// scene uses `ending_name`).

// --- Story / scenes ---

export interface StoryMeta {
  id: string;
  title: string;
  author: string;
  startNode: string;
  sceneCount: number;
  endingCount: number;
  zones: string[];
}

export interface Choice {
  text: string;
  target: string;
}

export interface NpcRef {
  id: string;
  name: string;
}

export interface Scene {
  id: string;
  title: string;
  text: string;
  type: "scene" | "ending";
  zone: string;
  ending_name: string | null;
  choices: Choice[];
  npcsPresent: NpcRef[];
}

export interface SceneSummary {
  id: string;
  title: string;
  zone: string;
  type: "scene" | "ending";
  choices: number;
}

export interface SceneList {
  startNode: string;
  count: number;
  scenes: SceneSummary[];
  deprecated: boolean;
}

export interface WorldMap {
  startNode: string;
  zones: Record<string, string[]>;
  nodes: { id: string; title: string; zone: string; type: string }[];
  edges: { from: string; to: string; text: string }[];
}

export interface ZoneList {
  count: number;
  zones: { zone: string; sceneCount: number }[];
}

export interface Ending {
  id: string;
  title: string;
  name: string;
  zone: string;
  text: string;
}

export interface EndingList {
  count: number;
  endings: Ending[];
}

// --- NPCs (served by the Flask NPC service) ---

export interface Npc {
  id: string;
  name: string;
  description: string;
  dialogs: { sceneId: string; dialog: string }[];
  inventory: { itemName: string; quantity: number }[];
}

export interface NpcList {
  count: number;
  npcs: Npc[];
}

export interface SceneNpcs {
  npcsPresent: NpcRef[];
}

export interface NpcDialog {
  sceneId: string;
  npc: { id: string; name: string; description: string };
  dialog: string;
}

// --- Items ---

export interface Item {
  id: string;
  created_at: string;
  name: string;
  description: string;
}

export interface ItemList {
  count: number;
  items: Item[];
}

// --- Shops ---

export interface ShopStockRow {
  price_caps: number;
  qty: number;
  item: { id: string; name: string; description: string };
}

export interface Shop {
  id: string;
  name: string;
  description: string;
  scene_id: string;
  stock: ShopStockRow[];
}

// --- Lore books ---

export interface LorePage {
  page_number: number;
  heading: string;
  content: string;
}

export interface LoreBook {
  id: string;
  title: string;
  author: string;
  synopsis: string;
  pages: LorePage[];
}

// --- Quests ---

export interface Quest {
  id: string;
  title: string;
  description: string;
  npc_slug: string;
  target_scene: string;
  reward_xp: number;
}

export interface QuestList {
  count: number;
  quests: Quest[];
}

export interface PlayerQuest {
  quest_id: string;
  status: "active" | "completed";
  accepted_at: string;
  completed_at: string | null;
}

export interface PlayerQuestLog {
  userId: string;
  count: number;
  quests: PlayerQuest[];
}

// --- Auth / player state ---

export interface LoginResponse {
  accessToken: string;
  tokenType: "bearer";
  user: { id: string; email: string };
}

export interface AuthUser {
  id: string;
  email: string;
}

export interface PlayerState {
  userId: string;
  currentScene: string | null;
  updatedAt: string | null;
}

export interface PlayerInventory {
  userId: string;
  count: number;
  items: { item_id: string; picked_up_at: string }[];
}
