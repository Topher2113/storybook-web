"use client";

import type { ThemeMeta } from "@/lib/themes";

// Mini mock of a scene card rendered in the candidate theme's own colors and
// heading font (inline styles — CSS vars on <html> only reflect the active
// theme). Mirrors the RN app's ThemePreviewCard: swatch row + name + mode.
export function ThemePreviewCard({
  theme,
  active,
  onSelect,
}: {
  theme: ThemeMeta;
  active: boolean;
  onSelect: () => void;
}) {
  const { colors } = theme;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className="w-full rounded-xl border-2 p-4 text-left transition-transform hover:scale-[1.02]"
      style={{
        background: colors.background,
        borderColor: active ? colors.accent : "transparent",
      }}
    >
      <div
        className="rounded-lg p-3"
        style={{ background: colors.surface }}
      >
        <div
          className="mb-1 text-lg"
          style={{
            color: colors.text,
            fontFamily: `${theme.previewFont}, Georgia, serif`,
            fontStyle: theme.id === "gothic" ? "italic" : "normal",
          }}
        >
          {theme.name}
        </div>
        <div
          className="mb-3 inline-block rounded-full px-3 py-1 text-xs font-bold"
          style={{ background: colors.primary, color: colors.buttonText }}
        >
          Begin Adventure
        </div>
        <div className="flex gap-1.5">
          {[
            colors.background,
            colors.surface,
            colors.primary,
            colors.text,
            colors.accent,
          ].map((c, i) => (
            <span
              key={i}
              className="h-4 w-4 rounded-full border"
              style={{ background: c, borderColor: colors.text + "33" }}
            />
          ))}
        </div>
      </div>
      <div
        className="mt-2 flex items-center justify-between text-sm"
        style={{ color: colors.text }}
      >
        <span>{theme.dark ? "Dark" : "Light"}</span>
        {active && <span style={{ color: colors.accent }}>✓ Active</span>}
      </div>
    </button>
  );
}
