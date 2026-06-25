export const n = (v: any) => Number(v ?? 0);

export function getPhase(aliveCount: number, totalCount: number): { label: string; instruction: string } {
  const pct = aliveCount / totalCount;
  if (pct > 0.75) return {
    label: 'EARLY GAME',
    instruction: 'Explore and gather resources. Avoid unnecessary fights. Consider forming alliances.',
  };
  if (pct > 0.40) return {
    label: 'MID GAME',
    instruction: 'Consolidate resources. Pressure weak opponents. Decide whether to honour alliances or betray.',
  };
  if (pct > 0.20) return {
    label: 'LATE GAME',
    instruction: 'The end is near. Alliances are liabilities. Strike decisively or defend your position.',
  };
  return {
    label: 'ENDGAME',
    instruction: 'FINAL SURVIVORS. Trust no one. Kill or be killed. This is your last stand.',
  };
}

export function getUrgentNeed(tf: any): string | null {
  if (n(tf.thirst)  >= 65) return 'WATER';
  if (n(tf.hunger)  >= 65) return 'FOOD';
  if (n(tf.injury)  >= 55) return 'MEDKIT';
  if (n(tf.fatigue) >= 75) return 'REST';
  return null;
}

export function getTileAt(allTiles: any[], x: number, y: number) {
  return allTiles.find(t => n(t.x) === x && n(t.y) === y);
}

export function nearestResource(allTiles: any[], fromX: number, fromY: number, resource: string, maxDist = 5): { x: number; y: number } | null {
  let best: { x: number; y: number } | null = null;
  let bestDist = Infinity;
  for (const tile of allTiles) {
    if (!tile.hasResource || tile.resourceType !== resource) continue;
    const d = Math.abs(n(tile.x) - fromX) + Math.abs(n(tile.y) - fromY);
    if (d < bestDist && d <= maxDist) { bestDist = d; best = { x: n(tile.x), y: n(tile.y) }; }
  }
  return best;
}

export function stepToward(fx: number, fy: number, tx: number, ty: number): { x: number; y: number } {
  if (fx === tx && fy === ty) return { x: fx, y: fy };
  const dx = tx - fx, dy = ty - fy;
  if (Math.abs(dx) >= Math.abs(dy)) return { x: fx + Math.sign(dx), y: fy };
  return { x: fx, y: fy + Math.sign(dy) };
}

export function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)); }

export function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

class RateLimiter {
  private calls: number[] = [];
  constructor(private readonly rpm: number) {}
  async acquire() {
    const now = Date.now();
    this.calls = this.calls.filter(t => now - t < 60_000);
    if (this.calls.length >= this.rpm) {
      const wait = 60_000 - (now - this.calls[0]) + 200;
      console.log(`  ⏳ Groq rate limit — waiting ${(wait / 1000).toFixed(1)}s…`);
      await sleep(wait);
      this.calls = this.calls.filter(t => Date.now() - t < 60_000);
    }
    this.calls.push(Date.now());
  }
}
export const groqLimiter = new RateLimiter(28); // 28 RPM — 2 below limit as buffer

