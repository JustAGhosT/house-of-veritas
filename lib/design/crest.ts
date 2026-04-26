export type CrestTier = "common" | "rare" | "mythic";

export type CrestParts = {
  prefix: string;
  core: string;
  suffix: string;
  frame: string;
  tier: CrestTier;
};

const PREFIXES = ["✦", "✶", "⚜", "❂", "✧", "☉"];
const CORES = ["V", "⟁", "☾", "☼", "⚔", "✴", "⌘"];
const SUFFIXES = ["✦", "✶", "⚜", "❂", "✧"];
const FRAMES = ["circle", "shield", "seal", "compass"];

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickTier(): CrestTier {
  const roll = Math.random();
  if (roll > 0.92) return "mythic";
  if (roll > 0.65) return "rare";
  return "common";
}

export function generateCrest(name: string): CrestParts & { label: string } {
  const tier = pickTier();
  const prefix = pick(PREFIXES);
  const core = pick(CORES);
  const suffix = pick(SUFFIXES);
  const frame = pick(FRAMES);

  return {
    prefix,
    core,
    suffix,
    frame,
    tier,
    label: `${prefix} ${name} ${core} ${suffix}`,
  };
}
