export const sigilGlyphs = {
  sacred: ["✦", "✧", "✶", "✴", "❂", "☉", "☾"],
  heraldic: ["⚜", "♜", "♛", "⚔", "⛨"],
  alchemical: ["🜂", "🜄", "🜁", "🜃", "☿"],
  structural: ["⌘", "⟁", "△", "◈", "◇"],
} as const;

export type SigilStyle = keyof typeof sigilGlyphs;

export function buildSigilText(
  name: string,
  style: SigilStyle = "sacred"
): string {
  const set = sigilGlyphs[style];
  const left = set[Math.floor(Math.random() * set.length)];
  const right = set[Math.floor(Math.random() * set.length)];
  return `${left} ${name} ${right}`;
}
