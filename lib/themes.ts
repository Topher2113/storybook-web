// The six storybook themes, ported hex-for-hex from the React Native app's
// constants/themes.ts. The actual colors/fonts live in globals.css as
// [data-theme] CSS variable blocks; this module is the metadata the theme
// picker and provider work from.

export interface ThemeMeta {
  id: string;
  name: string;
  dark: boolean;
  // Raw values duplicated here only for the preview cards, which must render
  // every theme's look at once (CSS vars on <html> can only show the active one).
  colors: {
    background: string;
    surface: string;
    primary: string;
    text: string;
    accent: string;
    buttonText: string;
  };
  previewFont: string;
}

export const THEMES: ThemeMeta[] = [
  {
    id: "parchment",
    name: "Parchment",
    dark: false,
    colors: {
      background: "#F5EDD6",
      surface: "#EDE0BE",
      primary: "#C9851A",
      text: "#2C1810",
      accent: "#8B4513",
      buttonText: "#FFF8EE",
    },
    previewFont: "var(--font-playfair)",
  },
  {
    id: "candlelight",
    name: "Candlelight",
    dark: false,
    colors: {
      background: "#FFF8E7",
      surface: "#FFF0CC",
      primary: "#E87C1A",
      text: "#3D2200",
      accent: "#CC5500",
      buttonText: "#FFF8E7",
    },
    previewFont: "var(--font-cinzel)",
  },
  {
    id: "morning-mist",
    name: "Morning Mist",
    dark: false,
    colors: {
      background: "#EEF2F7",
      surface: "#DDE6F0",
      primary: "#4A9EBF",
      text: "#1E3A52",
      accent: "#2E7A9E",
      buttonText: "#F0F4F8",
    },
    previewFont: "var(--font-nunito)",
  },
  {
    id: "midnight-tome",
    name: "Midnight Tome",
    dark: true,
    colors: {
      background: "#0D1117",
      surface: "#161B22",
      primary: "#D4A843",
      text: "#E2D9C8",
      accent: "#C09030",
      buttonText: "#120E04",
    },
    previewFont: "var(--font-cinzel-decorative)",
  },
  {
    id: "forest-shadow",
    name: "Forest Shadow",
    dark: true,
    colors: {
      background: "#0C1A0E",
      surface: "#152417",
      primary: "#3E7A2C",
      text: "#D4C9A8",
      accent: "#4A8C3A",
      buttonText: "#E8F4E8",
    },
    previewFont: "var(--font-oswald)",
  },
  {
    id: "gothic",
    name: "Gothic",
    dark: true,
    colors: {
      background: "#120816",
      surface: "#1E0F27",
      primary: "#6B1220",
      text: "#C9B8D8",
      accent: "#7A1B2A",
      buttonText: "#F0E8F0",
    },
    previewFont: "var(--font-im-fell)",
  },
];

export const DEFAULT_THEME_ID = "parchment";
export const THEME_STORAGE_KEY = "storybook.theme";

export function isThemeId(id: string): boolean {
  return THEMES.some((t) => t.id === id);
}
