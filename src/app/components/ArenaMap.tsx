import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ArenaTile {
  x: number; y: number;
  tileType: string;
  hasResource: boolean;
  resourceType?: string | null;
}
interface RosterEntry { tf: any; fighter: any; }
interface LiveEventLite {
  id: number; hour: number; eventType: string; description: string;
  x?: number | null; y?: number | null;
}
interface ArenaMapProps {
  width: number; height: number;
  tiles: ArenaTile[];
  roster: RosterEntry[];
  events?: LiveEventLite[];
  currentHour?: number;
  selectedFighterId?: number | null;
  onSelectFighter?: (fighterId: number) => void;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const TW   = 100;   // isometric tile diamond width
const TH   = 50;    // isometric tile diamond height
const EH   = 26;    // elevation units → screen pixels

// Terrain base and noise elevations
const BASE_ELEV: Record<string, number> = {
  WATER: 0, PLAIN: 2, SHELTER: 2, RUINS: 3, FOREST: 3, DANGER: 7, CORNUCOPIA: 2,
};
const NOISE_ELEV: Record<string, number> = {
  WATER: 0, PLAIN: 3, SHELTER: 2, RUINS: 3, FOREST: 3, DANGER: 5, CORNUCOPIA: 0,
};

// ─── Noise / elevation helpers ──────────────────────────────────────────────

function fract(n: number) { return n - Math.floor(n); }
function hash(x: number, y: number): number {
  return fract(Math.sin(x * 127.1 + y * 311.7 + x * y * 0.07) * 43758.5453123);
}
// Smooth noise for organic terrain
function smoothNoise(x: number, y: number): number {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = fract(x), fy = fract(y);
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  return (
    hash(ix,   iy)   * (1 - ux) * (1 - uy) +
    hash(ix+1, iy)   * ux       * (1 - uy) +
    hash(ix,   iy+1) * (1 - ux) * uy       +
    hash(ix+1, iy+1) * ux       * uy
  );
}
function tileCenterElev(tx: number, ty: number, tt: string): number {
  const base  = BASE_ELEV[tt]  ?? 2;
  const noise = NOISE_ELEV[tt] ?? 2;
  // Multi-octave smooth noise for organic lumps
  const n = smoothNoise(tx * 0.7, ty * 0.7) * 0.6 +
            smoothNoise(tx * 1.4 + 3.3, ty * 1.4 + 1.7) * 0.3 +
            smoothNoise(tx * 2.8 + 7.1, ty * 2.8 + 4.3) * 0.1;
  return base + n * noise;
}

// Vertex elevation = weighted average of surrounding tile centers → smooth slopes
function buildVertexElevGrid(
  W: number, H: number,
  tileTypeAt: (tx: number, ty: number) => string
): Float32Array {
  const verts = new Float32Array((W + 1) * (H + 1));
  for (let vy = 0; vy <= H; vy++) {
    for (let vx = 0; vx <= W; vx++) {
      // The four tiles that share this vertex
      const neighbours: [number, number][] = [
        [vx-1, vy-1], [vx, vy-1], [vx-1, vy], [vx, vy],
      ].filter(([tx, ty]) => tx >= 0 && tx < W && ty >= 0 && ty < H) as [number,number][];
      const elev = neighbours.length === 0 ? 0
        : neighbours.reduce((s, [tx, ty]) => s + tileCenterElev(tx, ty, tileTypeAt(tx, ty)), 0) / neighbours.length;
      verts[vy * (W + 1) + vx] = elev;
    }
  }
  return verts;
}

// ─── Colour helpers ──────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)];
}
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r,g,b].map(v => Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
}
function lerpColor(a: string, b: string, t: number): string {
  const [ar,ag,ab] = hexToRgb(a), [br,bg,bb] = hexToRgb(b);
  return rgbToHex(ar+(br-ar)*t, ag+(bg-ag)*t, ab+(bb-ab)*t);
}
function darken(hex: string, amt: number): string {
  const [r,g,b] = hexToRgb(hex); return rgbToHex(r*(1-amt), g*(1-amt), b*(1-amt));
}
function lighten(hex: string, amt: number): string {
  const [r,g,b] = hexToRgb(hex); return rgbToHex(r+(255-r)*amt, g+(255-g)*amt, b+(255-b)*amt);
}

// Elevation-based natural terrain colour (base layer, blended with biome)
function elevColor(elev: number): string {
  const stops: [number, string][] = [
    [0,  '#2e6fa8'],  // deep water
    [1,  '#3d8fc4'],  // shallow water
    [2,  '#4e9e3c'],  // lowland green
    [3,  '#5aaa44'],  // lush plain
    [4,  '#4a8c34'],  // plateau green
    [5,  '#6e7c4c'],  // highland
    [6,  '#7e6c50'],  // rocky slope
    [7,  '#8a7458'],  // rock
    [8,  '#7a7060'],  // grey rock
    [9,  '#909090'],  // stone
    [10, '#b8bcc0'],  // sub-snow
    [12, '#dce8f0'],  // snow cap
  ];
  for (let i = 0; i < stops.length - 1; i++) {
    const [e0, c0] = stops[i];
    const [e1, c1] = stops[i+1];
    if (elev <= e1) {
      const t = (elev - e0) / (e1 - e0);
      return lerpColor(c0, c1, Math.max(0, Math.min(1, t)));
    }
  }
  return stops[stops.length-1][1];
}

// Biome tint blended on top of the elevation colour
const BIOME_TINT: Record<string, [string, number]> = {
  PLAIN:      ['#5ab040', 0.28],
  FOREST:     ['#1e5818', 0.50],
  WATER:      ['#2460a0', 0.60],
  RUINS:      ['#907040', 0.40],
  SHELTER:    ['#3a6c30', 0.30],
  DANGER:     ['#707060', 0.22],
  CORNUCOPIA: ['#c8a020', 0.45],
};
function tileTopColor(tx: number, ty: number, tt: string, avgElev: number): string {
  const base = elevColor(avgElev);
  const [tint, weight] = BIOME_TINT[tt] ?? ['#808080', 0.2];
  // Add per-tile micro-variation
  const v = (hash(tx*3+1, ty*5+2) - 0.5) * 0.08;
  const c = lerpColor(base, tint, weight);
  const [r,g,b] = hexToRgb(c);
  return rgbToHex(r+(255-r)*Math.max(0,v), g+(255-g)*Math.max(0,v), b+(255-b)*Math.max(0,v));
}

// Side-face earth colour (cliff cross-section)
function sideColor(avgElev: number, face: 'left'|'right'): string {
  const base = avgElev < 1.5 ? '#1a3a60'
             : avgElev < 3   ? '#3a4c28'
             : avgElev < 6   ? '#5a4830'
             : avgElev < 9   ? '#504840'
             :                 '#787474';
  return face === 'left' ? darken(base, 0.22) : darken(base, 0.12);
}

// ─── ISO helpers ─────────────────────────────────────────────────────────────

function v2s(vx: number, vy: number, elev: number, ox: number, oy: number) {
  return {
    x: (vx - vy) * (TW / 2) + ox,
    y: (vx + vy) * (TH / 2) + oy - elev * EH,
  };
}

// ─── Canvas drawing ──────────────────────────────────────────────────────────

function drawQuad(
  ctx: CanvasRenderingContext2D,
  p0: {x:number;y:number}, p1: {x:number;y:number},
  p2: {x:number;y:number}, p3: {x:number;y:number},
  fill: string | CanvasGradient
) {
  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y);
  ctx.lineTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineTo(p3.x, p3.y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function drawTopFace(
  ctx: CanvasRenderingContext2D,
  n: {x:number;y:number}, e: {x:number;y:number},
  s: {x:number;y:number}, w: {x:number;y:number},
  color: string, tt: string
) {
  // Gradient: simulate sunlight from top-left
  const gx = ctx.createLinearGradient(w.x, n.y, e.x, s.y);
  gx.addColorStop(0,   lighten(color, 0.20));
  gx.addColorStop(0.35, lighten(color, 0.06));
  gx.addColorStop(1,   darken(color, 0.18));
  drawQuad(ctx, n, e, s, w, gx);

  // Water gets a specular shimmer band
  if (tt === 'WATER') {
    const sh = ctx.createLinearGradient(n.x, n.y, s.x, s.y);
    sh.addColorStop(0,   'rgba(180,220,255,0.22)');
    sh.addColorStop(0.4, 'rgba(100,180,255,0.08)');
    sh.addColorStop(1,   'rgba(20,80,160,0.06)');
    drawQuad(ctx, n, e, s, w, sh);
  }
  // Forest gets subtle canopy darkening in concave areas
  if (tt === 'FOREST') {
    const da = ctx.createRadialGradient(
      (n.x+e.x+s.x+w.x)/4, (n.y+e.y+s.y+w.y)/4, 2,
      (n.x+e.x+s.x+w.x)/4, (n.y+e.y+s.y+w.y)/4, TW*0.6
    );
    da.addColorStop(0,   'rgba(0,0,0,0.12)');
    da.addColorStop(0.6, 'rgba(0,0,0,0.04)');
    da.addColorStop(1,   'rgba(0,0,0,0)');
    drawQuad(ctx, n, e, s, w, da);
  }
}

function drawSideFace(
  ctx: CanvasRenderingContext2D,
  topA: {x:number;y:number}, topB: {x:number;y:number},
  botA: {x:number;y:number}, botB: {x:number;y:number},
  color: string
) {
  const g = ctx.createLinearGradient(topA.x, topA.y, botA.x, botA.y);
  g.addColorStop(0, darken(color, 0.05));
  g.addColorStop(1, darken(color, 0.45));
  drawQuad(ctx, topA, topB, botB, botA, g);
  // Edge line
  ctx.beginPath();
  ctx.moveTo(topA.x, topA.y);
  ctx.lineTo(topB.x, topB.y);
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 0.6;
  ctx.stroke();
}

// ─── Fighter / resource icon consts ─────────────────────────────────────────

const TERRAIN_PROPS: Record<string, string[]> = {
  PLAIN:  ['', '🌾', '', '🌿'],
  FOREST: ['🌲', '🌳', '🌲', '🌲'],
  WATER:  ['', '〰️', '', ''],
  RUINS:  ['🏛️', '🧱', '🪨', ''],
  SHELTER:['⛺', '', '🏚️', ''],
  DANGER: ['⛰️', '🪨', '', '🪨'],
  CORNUCOPIA: ['👑', '✨', '👑', '✨'],
};
const RESOURCE_ICONS: Record<string, string> = {
  FOOD:'🍖', WATER:'💧', MEDKIT:'🩹', WEAPON:'⚔️',
  ARMOR:'🛡️', INTEL:'📡', SMOKE:'💨', TRAP:'🪤',
};
const ARCHETYPE_COLORS: Record<string, string> = {
  AGGRESSIVE:'#e05548', STRATEGIC:'#4a8de0', COWARDLY:'#9a9a9a',
  DIPLOMATIC:'#4ae09c', BETRAYER:'#b04ae0', SURVIVALIST:'#e0c14a',
};
const EVENT_BURST_ICONS: Record<string, string> = {
  KILL:'⚔️', ALLIANCE:'🤝', BETRAYAL:'🗡️', FLEE:'💨',
  TRAP:'⚠️', ELIMINATION:'💀', SPONSOR:'🎁', COMBAT:'💥', PHASE:'📢',
};

// ─── Main component ──────────────────────────────────────────────────────────

export function ArenaMap({
  width, height, tiles, roster, events = [],
  currentHour, selectedFighterId, onSelectFighter,
}: ArenaMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredFighter, setHoveredFighter] = useState<{
    fighter: any; tf: any; sx: number; sy: number;
  } | null>(null);
  const [burst, setBurst] = useState<{id:number;icon:string;sx:number;sy:number}|null>(null);

  const W = width, H = height;

  const tileAt = useCallback((tx: number, ty: number) =>
    tiles.find(t => Number(t.x) === tx && Number(t.y) === ty),
  [tiles]);

  const tileTypeAt = useCallback((tx: number, ty: number): string =>
    tileAt(tx, ty)?.tileType ?? 'PLAIN',
  [tileAt]);

  // Build vertex elevation grid (only when tiles/dimensions change)
  const vertElevRef = useRef<Float32Array | null>(null);
  useEffect(() => {
    vertElevRef.current = buildVertexElevGrid(W, H, tileTypeAt);
  }, [W, H, tileTypeAt]);

  const getVE = useCallback((vx: number, vy: number): number => {
    if (!vertElevRef.current) return 0;
    const cVx = Math.max(0, Math.min(W, vx));
    const cVy = Math.max(0, Math.min(H, vy));
    return vertElevRef.current[cVy * (W + 1) + cVx];
  }, [W, H]);

  // Canvas dimensions — generous head-room for mountains
  const MAX_ELEV_PX = 14 * EH;
  const mapW = (W + H) * (TW / 2) + TW * 2;
  const mapH = (W + H) * (TH / 2) + MAX_ELEV_PX + TH * 3;
  const OX   = mapW / 2;
  const OY   = MAX_ELEV_PX + TH;

  const getScreen = useCallback((vx: number, vy: number) => {
    const elev = getVE(vx, vy);
    return v2s(vx, vy, elev, OX, OY);
  }, [getVE, OX, OY]);

  // ── Draw ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!vertElevRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = mapW * dpr;
    canvas.height = mapH * dpr;
    canvas.style.width  = `${mapW}px`;
    canvas.style.height = `${mapH}px`;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, mapH * 0.5);
    sky.addColorStop(0, '#06080e');
    sky.addColorStop(1, '#0d1520');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, mapW, mapH);

    // Painter's order: back-to-front (lowest x+y first)
    const order: [number,number][] = [];
    for (let ty = 0; ty < H; ty++)
      for (let tx = 0; tx < W; tx++)
        order.push([tx, ty]);
    order.sort(([ax,ay],[bx,by]) => {
      const da = ax + ay, db = bx + by;
      return da !== db ? da - db : ax - bx;
    });

    // Ground floor: fill deep water below all tiles
    ctx.fillStyle = '#0d2040';
    ctx.fillRect(0, 0, mapW, mapH);

    for (const [tx, ty] of order) {
      const tt = tileTypeAt(tx, ty);

      // 4 vertices of this tile in vertex-grid space
      // N = (tx, ty), E = (tx+1, ty), S = (tx+1, ty+1), W = (tx, ty+1)
      const vN = getScreen(tx,   ty);
      const vE = getScreen(tx+1, ty);
      const vS = getScreen(tx+1, ty+1);
      const vW = getScreen(tx,   ty+1);

      // Average elevation for color selection
      const avgElev = (getVE(tx,ty)+getVE(tx+1,ty)+getVE(tx+1,ty+1)+getVE(tx,ty+1)) / 4;
      const color   = tileTopColor(tx, ty, tt, avgElev);

      // Side faces — south edge only (visible from viewer)
      // South-west side: between vW and vS, going down to a fixed ground level
      const groundY = OY + (tx + ty + 2) * (TH / 2) + 8; // approximate ground floor
      const swColor = sideColor(avgElev, 'left');
      const seColor = sideColor(avgElev, 'right');

      if (vW.y < groundY || vS.y < groundY) {
        const gW = { x: vW.x, y: Math.max(vW.y, groundY - 2) + 6 };
        const gS = { x: vS.x, y: Math.max(vS.y, groundY - 2) + 6 };
        drawSideFace(ctx, vW, vS, gW, gS, seColor);
      }
      // South-south face
      {
        const gE = { x: vS.x, y: vS.y + EH * 1.2 + 4 };
        const gN = { x: vE.x, y: vE.y + EH * 1.2 + 4 };
        drawSideFace(ctx, vE, vS, gN, gE, swColor);
      }

      // Top (surface) face
      drawTopFace(ctx, vN, vE, vS, vW, color, tt);

      // Subtle tile edge — very faint outline on top face only
      ctx.beginPath();
      ctx.moveTo(vN.x, vN.y);
      ctx.lineTo(vE.x, vE.y);
      ctx.lineTo(vS.x, vS.y);
      ctx.lineTo(vW.x, vW.y);
      ctx.closePath();
      ctx.strokeStyle = 'rgba(0,0,0,0.09)';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Terrain prop emoji on the surface
      const props = TERRAIN_PROPS[tt] ?? [];
      const propChar = props[(tx * 17 + ty * 23) % (props.length || 1)];
      const cx = (vN.x + vE.x + vS.x + vW.x) / 4;
      const cy = (vN.y + vE.y + vS.y + vW.y) / 4;
      if (propChar) {
        ctx.font = '13px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.globalAlpha = 0.78;
        ctx.fillText(propChar, cx, cy - 2);
        ctx.globalAlpha = 1;
      }

      // Resource icon
      const tile = tileAt(tx, ty);
      if (tile?.hasResource && tile.resourceType) {
        ctx.font = '12px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(RESOURCE_ICONS[tile.resourceType] ?? '✦', cx, cy - 16);
      }
    }

    // ── Fighters ──────────────────────────────────────────────────────────────
    for (const { tf, fighter } of roster) {
      const fx = Number(tf.x), fy = Number(tf.y);
      const { x: sx, y: sy } = getScreen(fx, fy);
      const isDead     = !tf.isAlive;
      const isSelected = selectedFighterId === Number(fighter.id);
      const color      = isDead ? '#555' : (ARCHETYPE_COLORS[fighter.archetype] ?? '#d4af37');
      const r          = 11;
      const markerY    = sy - r - 4;

      // Shadow ellipse on terrain
      ctx.beginPath();
      ctx.ellipse(sx, sy + 2, r * 1.4, r * 0.45, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.40)';
      ctx.fill();

      // Vertical "stem" connecting dot to shadow
      ctx.beginPath();
      ctx.moveTo(sx, sy + 2);
      ctx.lineTo(sx, markerY + r);
      ctx.strokeStyle = 'rgba(0,0,0,0.30)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Outer ring glow for selection
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(sx, markerY, r + 7, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(212,175,55,0.45)';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Marker circle
      const grad = ctx.createRadialGradient(sx - r * 0.3, markerY - r * 0.3, 1, sx, markerY, r);
      grad.addColorStop(0, lighten(color, 0.4));
      grad.addColorStop(1, darken(color, 0.25));
      ctx.beginPath();
      ctx.arc(sx, markerY, r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = isSelected ? '#d4af37' : 'rgba(0,0,0,0.5)';
      ctx.lineWidth = isSelected ? 2.5 : 1;
      ctx.stroke();

      if (isDead) {
        ctx.font = 'bold 10px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';
        ctx.fillText('☠', sx, markerY);
      }

      // Name tag above marker
      const name = fighter.name?.split(' ')[0] ?? '?';
      ctx.font = '8px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      const tw = ctx.measureText(name).width + 8;
      const tagY = markerY - r - 4;
      ctx.fillStyle = 'rgba(0,0,0,0.60)';
      ctx.fillRect(sx - tw/2, tagY - 11, tw, 11);
      ctx.fillStyle = isDead ? 'rgba(255,255,255,0.45)' : (isSelected ? '#d4af37' : '#f0f0f0');
      ctx.fillText(name, sx, tagY);
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tiles, roster, selectedFighterId, W, H, mapW, mapH, OX, OY]);

  // ── Burst animation ──────────────────────────────────────────────────────────
  useEffect(() => {
    const located = events.filter(e => e.x != null && e.y != null);
    if (!located.length) return;
    const ev = located[0];
    const { x: sx, y: sy } = getScreen(Number(ev.x!), Number(ev.y!));
    setBurst({ id: ev.id, icon: EVENT_BURST_ICONS[ev.eventType] ?? '✦', sx, sy });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events]);

  // ── Mouse interaction ────────────────────────────────────────────────────────
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    let best: typeof hoveredFighter = null, bestD = 18;
    for (const { tf, fighter } of roster) {
      if (!tf.isAlive) continue;
      const { x: sx, y: sy } = getScreen(Number(tf.x), Number(tf.y));
      const markerY = sy - 11 - 4;
      const d = Math.hypot(mx - sx, my - markerY);
      if (d < bestD) { bestD = d; best = { fighter, tf, sx, sy: markerY }; }
    }
    setHoveredFighter(best);
  }, [roster, getScreen]);

  const alive = roster.filter(r => r.tf.isAlive);
  const tickerEvents = events.slice(0, 7);

  return (
    <div className="bg-[#060a12] border border-accent-crimson-end relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-separator/30">
        <div className="flex items-center gap-3">
          <h3 className="font-heading text-sm text-accent-gold uppercase tracking-wider">Live Arena</h3>
          <div className="flex items-center gap-1.5 bg-destructive/20 border border-destructive px-2 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
            <span className="font-mono text-[9px] tracking-widest text-destructive uppercase">On Air</span>
          </div>
          {currentHour !== undefined && (
            <span className="font-mono text-[10px] text-text-secondary">Hour {currentHour}</span>
          )}
        </div>
        <span className="font-mono text-[10px] text-text-secondary">{alive.length} fighters alive · hover for stats</span>
      </div>

      {/* Live ticker */}
      {tickerEvents.length > 0 && (
        <div className="overflow-hidden bg-black/40 border-b border-separator/20">
          <motion.div
            key={tickerEvents[0]?.id}
            className="inline-flex gap-14 py-1.5 px-4 font-mono text-[10px] text-text-secondary whitespace-nowrap"
            initial={{ x: '100%' }}
            animate={{ x: '-100%' }}
            transition={{ duration: 32, ease: 'linear', repeat: Infinity }}
          >
            {tickerEvents.map(ev => (
              <span key={ev.id}>
                <span className="text-accent-gold">[H{ev.hour}]</span>{' '}
                <span>{EVENT_BURST_ICONS[ev.eventType] ?? '•'}</span>{' '}
                <span className="text-text-primary">{ev.description}</span>
              </span>
            ))}
          </motion.div>
        </div>
      )}

      {/* Canvas + overlays */}
      <div className="overflow-auto relative" style={{ maxHeight: 540 }}>
        <div className="relative inline-block" style={{ minWidth: mapW }}>
          <canvas
            ref={canvasRef}
            style={{ display: 'block', cursor: hoveredFighter ? 'pointer' : 'default' }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredFighter(null)}
            onClick={() => hoveredFighter && onSelectFighter?.(Number(hoveredFighter.fighter.id))}
          />

          {/* Fighter tooltip */}
          <AnimatePresence>
            {hoveredFighter && (
              <motion.div
                key={Number(hoveredFighter.fighter.id)}
                initial={{ opacity: 0, scale: 0.95, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.1 }}
                className="absolute pointer-events-none bg-bg-primary/96 border border-accent-gold shadow-2xl p-3 w-48 font-mono text-xs z-50"
                style={{ left: hoveredFighter.sx + 16, top: hoveredFighter.sy - 50 }}
              >
                <div className="font-display text-sm text-accent-gold mb-0.5">{hoveredFighter.fighter.name}</div>
                <div className="text-text-secondary text-[9px] uppercase mb-2">{hoveredFighter.fighter.archetype}</div>
                {[
                  ['Position', `(${Number(hoveredFighter.tf.x)}, ${Number(hoveredFighter.tf.y)})`],
                  ['Status', hoveredFighter.tf.condition],
                  ['Hunger', Number(hoveredFighter.tf.hunger)],
                  ['Thirst', Number(hoveredFighter.tf.thirst)],
                  ['Fatigue', Number(hoveredFighter.tf.fatigue)],
                  ['Injury', `${Number(hoveredFighter.tf.injury)}%`],
                  ['Kills', Number(hoveredFighter.tf.kills ?? 0)],
                ].map(([label, val]) => (
                  <div key={String(label)} className="flex justify-between text-[10px]">
                    <span className="text-text-secondary">{label}</span>
                    <span className={String(label) === 'Injury' && Number(hoveredFighter.tf.injury) > 60 ? 'text-red-400' : 'text-text-primary'}>
                      {String(val)}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Event burst */}
          <AnimatePresence>
            {burst && (
              <motion.div
                key={burst.id}
                className="absolute pointer-events-none text-3xl z-60"
                style={{ left: burst.sx - 20, top: burst.sy - 50 }}
                initial={{ scale: 0, opacity: 0, y: 0 }}
                animate={{ scale: [0, 1.8, 1.3], opacity: [0, 1, 0], y: -30 }}
                transition={{ duration: 2.8, ease: 'easeOut' }}
                onAnimationComplete={() => setBurst(null)}
              >
                <span style={{ filter: 'drop-shadow(0 0 8px rgba(212,175,55,0.9))' }}>{burst.icon}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Archetype legend */}
      <div className="px-5 py-2.5 border-t border-separator/20 flex flex-wrap gap-x-5 gap-y-1">
        {Object.entries(ARCHETYPE_COLORS).map(([arch, color]) => (
          <div key={arch} className="flex items-center gap-1.5 font-mono text-[9px] text-text-secondary uppercase">
            <span className="w-2 h-2 rounded-full" style={{ background: color }} />
            {arch}
          </div>
        ))}
      </div>
    </div>
  );
}
