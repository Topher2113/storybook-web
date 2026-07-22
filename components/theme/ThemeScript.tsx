// Inline pre-hydration script: applies the saved theme before first paint so
// a hard refresh never flashes Parchment. Must stay dependency-free and tiny.
const script = `try{var t=localStorage.getItem("storybook.theme");if(t)document.documentElement.dataset.theme=t}catch(e){}`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
