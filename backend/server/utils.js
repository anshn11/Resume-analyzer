/** Generate a simple unique ID (same logic as frontend lib/utils.js) */
export function uid() {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}
