// "shiny-button" -> "Shiny Button" — inventory stores item ids; the HUD shows
// them without needing the item catalog.
export function prettifyId(id: string): string {
  return id
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
