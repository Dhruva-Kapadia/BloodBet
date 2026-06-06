import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createNoise2D } from 'simplex-noise';
import { motion } from 'motion/react';
import { RefreshCw } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TerrainType = 'water' | 'sand' | 'grass' | 'rock' | 'snow';
export type Biome = 'highlands' | 'island' | 'plains' | 'volcanic';

export interface ArenaMapHandle {
  getTerrainTypeAt: (x: number, z: number) => TerrainType;
}

interface ArenaTile { x: number; y: number; tileType: string; hasResource: boolean; resourceType?: string | null; }
interface RosterEntry { tf: any; fighter: any; }
interface LiveEventLite { id: number; hour: number; eventType: string; description: string; x?: number | null; y?: number | null; }

interface ArenaMapProps {
  // Three.js terrain props
  seed?: number;
  biome?: Biome;
  waterLevel?: number;
  gridSize?: number;
  // Legacy arena props (kept for compatibility)
  width?: number;
  height?: number;
  tiles?: ArenaTile[];
  roster?: RosterEntry[];
  events?: LiveEventLite[];
  currentHour?: number;
  selectedFighterId?: number | null;
  onSelectFighter?: (id: number) => void;
}

// ─── Biome configs ────────────────────────────────────────────────────────────

interface BiomeConfig {
  scale: number;        // noise frequency
  octaves: number;
  persistence: number;
  lacunarity: number;
  exponent: number;     // sharpens peaks
  heightMult: number;   // overall height scale
  label: string;
  fogColor: string;
  skyTop: string;
  skyBot: string;
}

const BIOME_CONFIGS: Record<Biome, BiomeConfig> = {
  highlands: {
    scale: 2.2, octaves: 7, persistence: 0.55, lacunarity: 2.0,
    exponent: 1.8, heightMult: 14,
    label: 'Highlands', fogColor: '#c8d8e8', skyTop: '#2a3a50', skyBot: '#4a6880',
  },
  island: {
    scale: 1.6, octaves: 6, persistence: 0.50, lacunarity: 2.1,
    exponent: 1.4, heightMult: 10,
    label: 'Island', fogColor: '#b8d4e8', skyTop: '#1a3050', skyBot: '#3870a8',
  },
  plains: {
    scale: 3.5, octaves: 5, persistence: 0.40, lacunarity: 2.2,
    exponent: 1.2, heightMult: 6,
    label: 'Plains', fogColor: '#d0dcc8', skyTop: '#283820', skyBot: '#5a7848',
  },
  volcanic: {
    scale: 1.8, octaves: 8, persistence: 0.62, lacunarity: 2.3,
    exponent: 2.4, heightMult: 18,
    label: 'Volcanic', fogColor: '#302018', skyTop: '#180808', skyBot: '#481010',
  },
};

// ─── Colour ramp ──────────────────────────────────────────────────────────────

interface ColorStop { t: number; color: THREE.Color; type: TerrainType; }

function buildColorRamp(biome: Biome, waterLevel: number): ColorStop[] {
  const wl = waterLevel;
  if (biome === 'volcanic') {
    return [
      { t: 0,          color: new THREE.Color('#1a0a0a'), type: 'water'  },
      { t: wl * 0.6,   color: new THREE.Color('#3a1010'), type: 'water'  },
      { t: wl,         color: new THREE.Color('#602020'), type: 'sand'   },
      { t: wl + 0.08,  color: new THREE.Color('#8b3a18'), type: 'sand'   },
      { t: wl + 0.22,  color: new THREE.Color('#5a3828'), type: 'grass'  },
      { t: wl + 0.45,  color: new THREE.Color('#3a2820'), type: 'rock'   },
      { t: wl + 0.65,  color: new THREE.Color('#281818'), type: 'rock'   },
      { t: 1,          color: new THREE.Color('#ff4010'), type: 'snow'   },
    ];
  }
  if (biome === 'island') {
    return [
      { t: 0,          color: new THREE.Color('#0d2a4a'), type: 'water'  },
      { t: wl * 0.5,   color: new THREE.Color('#1a4a80'), type: 'water'  },
      { t: wl,         color: new THREE.Color('#2a6ab0'), type: 'water'  },
      { t: wl + 0.04,  color: new THREE.Color('#d4c080'), type: 'sand'   },
      { t: wl + 0.10,  color: new THREE.Color('#c8b050'), type: 'sand'   },
      { t: wl + 0.22,  color: new THREE.Color('#4a9040'), type: 'grass'  },
      { t: wl + 0.45,  color: new THREE.Color('#3a7830'), type: 'grass'  },
      { t: wl + 0.62,  color: new THREE.Color('#7a7060'), type: 'rock'   },
      { t: wl + 0.80,  color: new THREE.Color('#a8a0a0'), type: 'rock'   },
      { t: 1,          color: new THREE.Color('#e8f0f8'), type: 'snow'   },
    ];
  }
  // highlands + plains share similar ramp
  return [
    { t: 0,          color: new THREE.Color('#0a1828'), type: 'water'  },
    { t: wl * 0.6,   color: new THREE.Color('#1a3860'), type: 'water'  },
    { t: wl,         color: new THREE.Color('#2a5898'), type: 'water'  },
    { t: wl + 0.03,  color: new THREE.Color('#c8b870'), type: 'sand'   },
    { t: wl + 0.09,  color: new THREE.Color('#b8a858'), type: 'sand'   },
    { t: wl + 0.20,  color: new THREE.Color('#5aaa40'), type: 'grass'  },
    { t: wl + 0.42,  color: new THREE.Color('#3a8030'), type: 'grass'  },
    { t: wl + 0.60,  color: new THREE.Color('#686858'), type: 'rock'   },
    { t: wl + 0.78,  color: new THREE.Color('#909090'), type: 'rock'   },
    { t: 1,          color: new THREE.Color('#e8f0f8'), type: 'snow'   },
  ];
}

function sampleRamp(ramp: ColorStop[], t: number): { color: THREE.Color; type: TerrainType } {
  t = Math.max(0, Math.min(1, t));
  for (let i = 0; i < ramp.length - 1; i++) {
    const a = ramp[i], b = ramp[i + 1];
    if (t <= b.t) {
      const f = (t - a.t) / (b.t - a.t);
      return { color: a.color.clone().lerp(b.color, f), type: f < 0.5 ? a.type : b.type };
    }
  }
  const last = ramp[ramp.length - 1];
  return { color: last.color.clone(), type: last.type };
}

// ─── Seeded pseudo-RNG (mulberry32) for deterministic noise seed ──────────────

function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let z = Math.imul(seed ^ seed >>> 15, 1 | seed);
    z = z + Math.imul(z ^ z >>> 7, 61 | z) ^ z;
    return ((z ^ z >>> 14) >>> 0) / 4294967296;
  };
}

// ─── Noise heightmap ──────────────────────────────────────────────────────────

function buildHeightmap(
  segs: number,
  seed: number,
  biome: Biome,
  waterLevel: number,
): { heights: Float32Array; minH: number; maxH: number } {
  const cfg = BIOME_CONFIGS[biome];
  const rng = mulberry32(seed);
  // Create noise with seeded random
  const noise2D = createNoise2D(rng);

  const verts = segs + 1;
  const heights = new Float32Array(verts * verts);
  let minH = Infinity, maxH = -Infinity;

  for (let vy = 0; vy < verts; vy++) {
    for (let vx = 0; vx < verts; vx++) {
      let nx = (vx / segs - 0.5) * cfg.scale;
      let ny = (vy / segs - 0.5) * cfg.scale;

      // FBM
      let h = 0, amp = 1, freq = 1, total = 0;
      for (let o = 0; o < cfg.octaves; o++) {
        h += noise2D(nx * freq, ny * freq) * amp;
        total += amp;
        amp *= cfg.persistence;
        freq *= cfg.lacunarity;
      }
      h = (h / total + 1) * 0.5; // 0..1

      // Island falloff: radial gradient forcing edges to water
      if (biome === 'island') {
        const dx = vx / segs - 0.5, dy = vy / segs - 0.5;
        const d = Math.sqrt(dx * dx + dy * dy) * 2.2;
        h *= Math.max(0, 1 - d * d);
      }

      // Apply exponent for peak sharpening
      h = Math.pow(Math.max(0, h), cfg.exponent);

      heights[vy * verts + vx] = h;
      if (h < minH) minH = h;
      if (h > maxH) maxH = h;
    }
  }

  // Normalize to 0..1
  const range = maxH - minH || 1;
  for (let i = 0; i < heights.length; i++) heights[i] = (heights[i] - minH) / range;

  return { heights, minH: 0, maxH: 1 };
}

// ─── Component ────────────────────────────────────────────────────────────────

const EVENT_BURST_ICONS: Record<string, string> = {
  KILL:'⚔️', ALLIANCE:'🤝', BETRAYAL:'🗡️', FLEE:'💨',
  TRAP:'⚠️', ELIMINATION:'💀', SPONSOR:'🎁', COMBAT:'💥', PHASE:'📢',
};

export const ArenaMap = forwardRef<ArenaMapHandle, ArenaMapProps>(function ArenaMap(
  {
    seed: seedProp,
    biome: biomeProp = 'highlands',
    waterLevel = 0.35,
    gridSize = 12,
    // legacy
    roster = [],
    events = [],
    currentHour,
    selectedFighterId,
    onSelectFighter,
  },
  ref,
) {
  const mountRef   = useRef<HTMLDivElement>(null);
  const sceneRef   = useRef<THREE.Scene | null>(null);
  const rendRef    = useRef<THREE.WebGLRenderer | null>(null);
  const camRef     = useRef<THREE.PerspectiveCamera | null>(null);
  const ctrlRef    = useRef<OrbitControls | null>(null);
  const rafRef     = useRef<number>(0);
  const terrainRef = useRef<{ heights: Float32Array; segs: number } | null>(null);

  const [seed, setSeed]     = useState(seedProp ?? Math.floor(Math.random() * 999999));
  const [biome, setBiome]   = useState<Biome>(biomeProp);
  const [hoveredCell, setHoveredCell] = useState<{ x: number; z: number } | null>(null);
  const [isBuilding, setIsBuilding]   = useState(false);

  // Expose getTerrainTypeAt via ref
  useImperativeHandle(ref, () => ({
    getTerrainTypeAt(x: number, z: number): TerrainType {
      if (!terrainRef.current) return 'grass';
      const { heights, segs } = terrainRef.current;
      const verts = segs + 1;
      const vx = Math.round((x / gridSize) * segs);
      const vz = Math.round((z / gridSize) * segs);
      const cx = Math.max(0, Math.min(segs, vx));
      const cz = Math.max(0, Math.min(segs, vz));
      const h = heights[cz * verts + cx];
      const ramp = buildColorRamp(biome, waterLevel);
      return sampleRamp(ramp, h).type;
    },
  }));

  // ── Build scene ─────────────────────────────────────────────────────────────

  const buildScene = useCallback(() => {
    const mount = mountRef.current;
    if (!mount) return;

    setIsBuilding(true);

    // Dispose previous
    if (ctrlRef.current)  { ctrlRef.current.dispose();  ctrlRef.current  = null; }
    if (rendRef.current)  { rendRef.current.dispose();  rendRef.current  = null; }
    if (sceneRef.current) {
      sceneRef.current.traverse(obj => {
        if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
        const mat = (obj as THREE.Mesh).material;
        if (mat) Array.isArray(mat) ? mat.forEach(m => m.dispose()) : mat.dispose();
      });
      sceneRef.current = null;
    }
    cancelAnimationFrame(rafRef.current);
    mount.innerHTML = '';

    const W = mount.clientWidth || 800;
    const H = 500;
    const SEGS = 160; // geometry segments (perf cap)

    // ── Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    mount.appendChild(renderer.domElement);
    rendRef.current = renderer;

    // ── Scene
    const scene = new THREE.Scene();
    const cfg = BIOME_CONFIGS[biome];
    scene.background = new THREE.Color(cfg.skyBot);
    scene.fog = new THREE.FogExp2(cfg.fogColor, 0.025);
    sceneRef.current = scene;

    // Sky gradient plane (background quad)
    {
      const skyGeo = new THREE.PlaneGeometry(200, 200);
      const skyColors = new Float32Array(skyGeo.attributes.position.count * 3);
      const topC = new THREE.Color(cfg.skyTop), botC = new THREE.Color(cfg.skyBot);
      const pos = skyGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const t = (pos.getY(i) + 100) / 200;
        const c = botC.clone().lerp(topC, t);
        skyColors[i * 3] = c.r; skyColors[i * 3 + 1] = c.g; skyColors[i * 3 + 2] = c.b;
      }
      skyGeo.setAttribute('color', new THREE.BufferAttribute(skyColors, 3));
      const skyMat = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide });
      const sky = new THREE.Mesh(skyGeo, skyMat);
      sky.rotation.x = Math.PI / 2; sky.position.y = 80;
      scene.add(sky);
    }

    // ── Camera
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 500);
    camera.position.set(0, 18, 22);
    camera.lookAt(0, 0, 0);
    camRef.current = camera;

    // ── Orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.minDistance = 8;
    controls.maxDistance = 60;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.update();
    ctrlRef.current = controls;

    // ── Heightmap
    const { heights } = buildHeightmap(SEGS, seed, biome, waterLevel);
    terrainRef.current = { heights, segs: SEGS };
    const ramp = buildColorRamp(biome, waterLevel);

    // ── Terrain geometry
    const SIZE = 20;
    const geo = new THREE.PlaneGeometry(SIZE, SIZE, SEGS, SEGS);
    geo.rotateX(-Math.PI / 2);

    const posAttr   = geo.attributes.position as THREE.BufferAttribute;
    const verts     = SEGS + 1;
    const colors    = new Float32Array(posAttr.count * 3);
    const heightMul = cfg.heightMult;

    for (let vy = 0; vy < verts; vy++) {
      for (let vx = 0; vx < verts; vx++) {
        const idx = vy * verts + vx;
        const h = heights[idx];
        const worldH = h * heightMul;
        // PlaneGeometry after rotateX: vertex index matches row-major order
        posAttr.setY(idx, worldH);
        const { color } = sampleRamp(ramp, h);
        colors[idx * 3]     = color.r;
        colors[idx * 3 + 1] = color.g;
        colors[idx * 3 + 2] = color.b;
      }
    }
    posAttr.needsUpdate = true;
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.88,
      metalness: 0.04,
      flatShading: false,
    });
    const terrain = new THREE.Mesh(geo, terrainMat);
    terrain.receiveShadow = true;
    terrain.castShadow    = false;
    scene.add(terrain);

    // ── Water plane
    const waterH = waterLevel * heightMul - 0.08;
    const waterGeo = new THREE.PlaneGeometry(SIZE, SIZE);
    waterGeo.rotateX(-Math.PI / 2);
    const waterColor = biome === 'volcanic'
      ? new THREE.Color('#601010')
      : biome === 'island'
        ? new THREE.Color('#1a5090')
        : new THREE.Color('#1a3870');
    const waterMat = new THREE.MeshStandardMaterial({
      color: waterColor,
      transparent: true,
      opacity: 0.72,
      roughness: 0.05,
      metalness: 0.3,
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.y = waterH;
    scene.add(water);

    // ── Grid overlay (12×12 cells mapped onto terrain)
    {
      const gridGroup = new THREE.Group();
      const cellSize  = SIZE / gridSize;
      const lineMat   = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.12 });

      for (let i = 0; i <= gridSize; i++) {
        const t = i / gridSize;
        // Sample average height along this grid line
        const makePoints = (axis: 'x' | 'z') => {
          const pts: THREE.Vector3[] = [];
          for (let j = 0; j <= gridSize; j++) {
            const tj = j / gridSize;
            let vx_: number, vz_: number;
            if (axis === 'x') { vx_ = Math.round(t  * SEGS); vz_ = Math.round(tj * SEGS); }
            else              { vx_ = Math.round(tj * SEGS); vz_ = Math.round(t  * SEGS); }
            const h = heights[vz_ * verts + vx_] * heightMul + 0.18;
            const wx = (axis === 'x' ? t  : tj) * SIZE - SIZE / 2;
            const wz = (axis === 'x' ? tj : t ) * SIZE - SIZE / 2;
            pts.push(new THREE.Vector3(wx, h, wz));
          }
          return pts;
        };
        const lineX = new THREE.Line(new THREE.BufferGeometry().setFromPoints(makePoints('x')), lineMat);
        const lineZ = new THREE.Line(new THREE.BufferGeometry().setFromPoints(makePoints('z')), lineMat);
        gridGroup.add(lineX, lineZ);
      }
      scene.add(gridGroup);

      // Hover highlight plane (single cell)
      const hlGeo = new THREE.PlaneGeometry(cellSize * 0.96, cellSize * 0.96);
      hlGeo.rotateX(-Math.PI / 2);
      const hlMat = new THREE.MeshBasicMaterial({ color: 0xd4af37, transparent: true, opacity: 0, depthWrite: false });
      const hlMesh = new THREE.Mesh(hlGeo, hlMat);
      hlMesh.name = 'highlight';
      scene.add(hlMesh);

      // Raycaster for hover
      const raycaster = new THREE.Raycaster();
      const mouse     = new THREE.Vector2();
      const onMove = (e: MouseEvent) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x =  ((e.clientX - rect.left)  / rect.width)  * 2 - 1;
        mouse.y = -((e.clientY - rect.top)   / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObject(terrain);
        if (hits.length) {
          const p = hits[0].point;
          const cx = Math.floor((p.x + SIZE / 2) / cellSize);
          const cz = Math.floor((p.z + SIZE / 2) / cellSize);
          if (cx >= 0 && cx < gridSize && cz >= 0 && cz < gridSize) {
            setHoveredCell({ x: cx, z: cz });
            // Position highlight
            const wx = (cx + 0.5) * cellSize - SIZE / 2;
            const wz = (cz + 0.5) * cellSize - SIZE / 2;
            const vxH = Math.round(((cx + 0.5) / gridSize) * SEGS);
            const vzH = Math.round(((cz + 0.5) / gridSize) * SEGS);
            const hh  = heights[vzH * verts + vxH] * heightMul + 0.12;
            hlMesh.position.set(wx, hh, wz);
            hlMat.opacity = 0.22;
            return;
          }
        }
        setHoveredCell(null);
        hlMat.opacity = 0;
      };
      renderer.domElement.addEventListener('mousemove', onMove);
    }

    // ── Lighting
    const ambient = new THREE.AmbientLight(0xffffff, biome === 'volcanic' ? 0.3 : 0.55);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(
      biome === 'volcanic' ? 0xff6030 : 0xfff4d0,
      biome === 'volcanic' ? 2.0 : 1.6,
    );
    sun.position.set(12, 24, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near   = 0.5;
    sun.shadow.camera.far    = 80;
    sun.shadow.camera.left   = -15;
    sun.shadow.camera.right  = 15;
    sun.shadow.camera.top    = 15;
    sun.shadow.camera.bottom = -15;
    scene.add(sun);

    // Fill light from opposite side
    const fill = new THREE.DirectionalLight(
      biome === 'island' ? 0x80c0ff : 0x8090b0, 0.4,
    );
    fill.position.set(-10, 8, -12);
    scene.add(fill);

    // Hemisphere light for sky colour bounce
    const hemi = new THREE.HemisphereLight(
      new THREE.Color(cfg.skyTop),
      new THREE.Color(biome === 'volcanic' ? '#400' : '#184028'),
      0.5,
    );
    scene.add(hemi);

    // ── Resize handler
    const onResize = () => {
      const w = mount.clientWidth;
      renderer.setSize(w, H);
      camera.aspect = w / H;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    // ── Render loop
    let frame = 0;
    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
      frame++;
      controls.update();
      // Subtle water animation
      if (frame % 2 === 0) {
        (waterMat as THREE.MeshStandardMaterial).opacity = 0.68 + Math.sin(frame * 0.04) * 0.04;
      }
      renderer.render(scene, camera);
    };
    tick();

    setIsBuilding(false);

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(rafRef.current);
      controls.dispose();
      renderer.dispose();
      scene.traverse(obj => {
        if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
        const mat = (obj as THREE.Mesh).material;
        if (mat) Array.isArray(mat) ? mat.forEach(m => m.dispose()) : mat.dispose();
      });
    };
  }, [seed, biome, waterLevel, gridSize]);

  useEffect(() => {
    const cleanup = buildScene();
    return cleanup;
  }, [buildScene]);

  const regenerate = () => setSeed(Math.floor(Math.random() * 999999));

  const ticker = events.slice(0, 6);
  const alive  = roster.filter(r => r.tf?.isAlive);

  return (
    <div className="bg-[#060a12] border border-accent-crimson-end relative overflow-hidden select-none font-mono">
      {/* Header bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-separator/30">
        <div className="flex items-center gap-3">
          <h3 className="font-heading text-sm text-accent-gold uppercase tracking-wider">Live Arena</h3>
          <span className="flex items-center gap-1.5 bg-destructive/20 border border-destructive px-2 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
            <span className="font-mono text-[9px] tracking-widest text-destructive uppercase">On Air</span>
          </span>
          {currentHour !== undefined && (
            <span className="font-mono text-[10px] text-text-secondary">Hour {currentHour}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {alive.length > 0 && (
            <span className="font-mono text-[10px] text-text-secondary">{alive.length} alive</span>
          )}
          <button
            onClick={regenerate}
            disabled={isBuilding}
            className="flex items-center gap-1.5 font-mono text-[10px] text-text-secondary hover:text-accent-gold border border-separator/40 hover:border-accent-gold/40 px-2.5 py-1.5 transition-colors disabled:opacity-40"
          >
            <RefreshCw className={`w-3 h-3 ${isBuilding ? 'animate-spin' : ''}`} />
            Regenerate
          </button>
        </div>
      </div>

      {/* Event ticker */}
      {ticker.length > 0 && (
        <div className="overflow-hidden bg-black/40 border-b border-separator/20">
          <motion.div
            key={ticker[0]?.id}
            className="inline-flex gap-14 py-1.5 px-4 font-mono text-[10px] text-text-secondary whitespace-nowrap"
            initial={{ x: '100%' }} animate={{ x: '-100%' }}
            transition={{ duration: 32, ease: 'linear', repeat: Infinity }}
          >
            {ticker.map(ev => (
              <span key={ev.id}>
                <span className="text-accent-gold">[H{ev.hour}]</span>{' '}
                {EVENT_BURST_ICONS[ev.eventType] ?? '•'}{' '}
                <span className="text-text-primary">{ev.description}</span>
              </span>
            ))}
          </motion.div>
        </div>
      )}

      {/* Three.js mount */}
      <div className="relative" style={{ height: 500 }}>
        <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

        {/* Overlay info */}
        <div className="absolute top-3 left-4 pointer-events-none flex flex-col gap-1">
          <span className="bg-black/60 border border-white/10 px-2.5 py-1 text-[10px] text-accent-gold uppercase tracking-widest">
            {BIOME_CONFIGS[biome].label}
          </span>
          <span className="bg-black/50 px-2 py-0.5 text-[9px] text-text-secondary">
            seed {seed}
          </span>
        </div>

        {/* Hovered cell info */}
        {hoveredCell && (
          <div className="absolute bottom-4 left-4 pointer-events-none bg-black/70 border border-white/10 px-3 py-2 text-[10px] text-text-secondary">
            Cell ({hoveredCell.x}, {hoveredCell.z})
          </div>
        )}

        {/* Controls hint */}
        <div className="absolute bottom-3 right-4 pointer-events-none flex gap-3 text-[9px] text-white/25">
          <span>drag · rotate</span>
          <span>scroll · zoom</span>
          <span>right-drag · pan</span>
        </div>

        {/* Biome selector */}
        <div className="absolute top-3 right-4 pointer-events-auto flex gap-1.5">
          {(['highlands','island','plains','volcanic'] as Biome[]).map(b => (
            <button
              key={b}
              onClick={() => setBiome(b)}
              className={`font-mono text-[9px] uppercase px-2 py-1 border transition-colors ${
                biome === b
                  ? 'border-accent-gold text-accent-gold bg-accent-gold/10'
                  : 'border-white/15 text-white/35 hover:text-white/60 hover:border-white/30'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});
