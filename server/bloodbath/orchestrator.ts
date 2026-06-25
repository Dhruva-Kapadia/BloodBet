import { DbConnection } from '../../src/spacetime';
import { workflow } from './graph/workflow';
import { n } from './graph/utils';

const SPACETIME_URI     = process.env.SPACETIMEDB_HOST || 'wss://maincloud.spacetimedb.com';
const DB_NAME           = process.env.SPACETIMEDB_DB_NAME || 'bloodbet-dre-dev';
const HOUR_INTERVAL_MS  = 15_000;
const BETTING_WINDOW_MS = 5 * 60 * 1000;

const ARENA_TYPES = [
  'ARCTIC WASTELAND', 'JUNGLE LABYRINTH',
  'VOLCANIC PEAKS',   'URBAN RUINS',
  'DESERT COLOSSEUM',
];

async function runHour(conn: DbConnection, tournamentId: number) {
  const tournament = [...conn.db.tournament.iter()].find(t => n(t.id) === tournamentId);
  if (!tournament || tournament.status !== 'LIVE') return;

  const hour    = n(tournament.currentHour);
  const gridW   = n(tournament.gridWidth)  || 12;
  const gridH   = n(tournament.gridHeight) || 12;
  const allTf   = [...conn.db.tournamentFighter.iter()].filter(tf => n(tf.tournamentId) === tournamentId);
  const alive   = allTf.filter(tf => tf.isAlive);
  const total   = allTf.length;
  const isNight = hour % 24 >= 20 || hour % 24 < 6;

  if (alive.length <= 1) {
    console.log(`[T${tournamentId}] Only ${alive.length} fighter(s) remaining — ending`);
    return;
  }

  const allTiles = [...conn.db.arenaTile.iter()].filter(t => n(t.tournamentId) === tournamentId);
  const allFighters = [...conn.db.fighterTemplate.iter()];

  // Pre-join fighter data
  const fightersWithData = allTf.map(tf => ({
    ...tf,
    fighterData: allFighters.find(f => n(f.id) === n(tf.fighterId))
  }));

  const board_state = {
    fighters: fightersWithData,
    tiles: allTiles,
    aliveCount: alive.length,
    totalCount: total,
    hour,
    gridW,
    gridH
  };

  console.log(`\n[T${tournamentId}] Hour ${hour} (${isNight ? '🌙' : '☀️'}) — ${alive.length}/${total} alive`);

  try {
    // Run LangGraph MAS
    const result = await workflow.invoke({
      tournamentId,
      board_state,
      recent_events: [] 
    });

    const decisionsMap = result.character_decisions || {};
    const decisions: any[] = Object.values(decisionsMap);

    console.log(`\n📢 Game Master Narrative:\n${result.global_narrative}\n`);
    
    for (const d of decisions) {
        const fighter = allFighters.find(f => n(f.id) === n(d.fighterId));
        console.log(`  [${fighter?.name || d.fighterId}] ${d.action} — "${d.reasoning ?? ''}"`);
    }

    console.log(`  → Advancing hour with ${decisions.length} decisions…`);
    conn.reducers.advanceHour({ tournamentId, decisions: JSON.stringify(decisions) });
    console.log(`  ✓ Hour ${hour} complete`);
  } catch (err) {
    console.error(`❌ LangGraph Orchestration failed for hour ${hour}:`, err);
  }
}

// ─── Orchestration Loop ───────────────────────────────────────────────────────

function startLoop(conn: DbConnection) {
  console.log(`\n⏱️  ${HOUR_INTERVAL_MS / 1000}s per in-game hour | ${BETTING_WINDOW_MS / 1000}s betting window\n`);

  const bettingOpenedAt: Record<number, number> = {};

  setInterval(async () => {
    const all      = [...conn.db.tournament.iter()];
    const live     = all.filter(t => t.status === 'LIVE');
    const upcoming = all.filter(t => t.status === 'UPCOMING');

    // Advance all live tournaments in parallel
    if (live.length > 0) {
      await Promise.all(live.map(t => runHour(conn, n(t.id))));
      return;
    }

    // Handle upcoming tournaments
    if (upcoming.length > 0) {
      const t   = upcoming[0];
      const tid = n(t.id);

      if (!bettingOpenedAt[tid]) {
        bettingOpenedAt[tid] = Date.now();
        console.log(`🎰 BETTING OPEN — "${t.name}" | ${BETTING_WINDOW_MS / 1000}s remaining`);
        return;
      }

      const elapsed = Date.now() - bettingOpenedAt[tid];
      if (elapsed < BETTING_WINDOW_MS) {
        const rem = Math.ceil((BETTING_WINDOW_MS - elapsed) / 1000);
        console.log(`⏳ ${rem}s remaining to bet on "${t.name}"`);
        return;
      }

      console.log(`🏟️  Starting "${t.name}" (id:${tid})…`);
      delete bettingOpenedAt[tid];
      try {
        conn.reducers.startTournament({ tournamentId: tid });
      } catch (e: any) {
        console.error('  ❌ Failed to start tournament:', e?.message ?? e);
      }
      return;
    }

    // No tournaments at all — create one
    console.log('📣 No active tournaments — creating one…');
    const arena = ARENA_TYPES[Math.floor(Date.now() / 1000) % ARENA_TYPES.length];
    const num   = Date.now().toString().slice(-4);
    try {
      conn.reducers.createTournament({ name: `Tournament #${num}`, arenaType: arena });
    } catch (e: any) {
      console.error('  ❌ Failed to create tournament:', e?.message ?? e);
    }
  }, HOUR_INTERVAL_MS);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🎮 BloodBets Orchestrator v4 — LangGraph Edition');

  DbConnection.builder()
    .withUri(SPACETIME_URI)
    .withDatabaseName(DB_NAME)
    .onConnect((ctx, identity, _token) => {
      console.log('✅ Connected as:', identity.toHexString());
      ctx.subscriptionBuilder()
        .onApplied(() => {
          const tCount = [...ctx.db.tournament.iter()].length;
          const fCount = [...ctx.db.fighterTemplate.iter()].length;
          console.log(`📡 Subscribed — Tournaments: ${tCount}, Fighters: ${fCount}`);
          startLoop(ctx as unknown as DbConnection);
        })
        .subscribe([
          'SELECT * FROM tournament',
          'SELECT * FROM tournamentFighter',
          'SELECT * FROM fighterTemplate',
          'SELECT * FROM arenaTile',
          'SELECT * FROM liveEvent',
          'SELECT * FROM sponsorDrop',
        ]);
    })
    .onConnectError((_ctx, err) => { console.error('❌ Connection failed:', err); process.exit(1); })
    .onDisconnect(() => console.log('🔌 Disconnected'))
    .build();
}

main().catch(console.error);
