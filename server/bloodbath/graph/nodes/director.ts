import { GameState } from '../state';
import { n, getPhase, getTileAt } from '../utils';

export async function directorNode(state: GameState): Promise<Partial<GameState>> {
  const { board_state } = state;
  const inboxes: Record<number, string> = {};

  const alive = board_state.fighters.filter(tf => tf.isAlive);
  const isNight = board_state.hour % 24 >= 20 || board_state.hour % 24 < 6;
  const vision = isNight ? 1 : 2;
  const phase = getPhase(alive.length, board_state.totalCount);

  for (const tf of alive) {
    const fighter = tf.fighterData; // pre-joined by the orchestrator

    const visibleTfs = alive.filter(other =>
      n(other.fighterId) !== n(tf.fighterId) &&
      Math.abs(n(other.x) - n(tf.x)) <= vision &&
      Math.abs(n(other.y) - n(tf.y)) <= vision
    );

    const allies: number[] = JSON.parse(tf.alliances ?? '[]');
    const inventory: string[] = JSON.parse(tf.inventory ?? '[]');

    const enemies = visibleTfs
      .filter(f => !allies.includes(n(f.fighterId)))
      .map(f => `${f.fighterData?.name}#${n(f.fighterId)}(inj:${n(f.injury)}%,k:${n(f.kills)})`);
    
    const alliesVis = visibleTfs
      .filter(f => allies.includes(n(f.fighterId)))
      .map(f => `${f.fighterData?.name}#${n(f.fighterId)}`);

    const nearbyTiles = board_state.tiles.filter(t =>
      Math.abs(n(t.x) - n(tf.x)) <= 2 && Math.abs(n(t.y) - n(tf.y)) <= 2
    );
    const nearbyResources = nearbyTiles
      .filter(t => t.hasResource && t.resourceType)
      .map(t => `${t.resourceType}@(${n(t.x)},${n(t.y)})`);
      
    const currentTile = getTileAt(board_state.tiles, n(tf.x), n(tf.y));
    const currentTileType = currentTile?.tileType ?? 'PLAIN';

    const archetypeShort: Record<string, string> = {
      AGGRESSIVE:'fight hard', STRATEGIC:'think first', COWARDLY:'avoid danger',
      DIPLOMATIC:'build alliances', BETRAYER:'gain then betray trust', SURVIVALIST:'hoard resources',
    };

    const prompt = `${fighter.name} [${fighter.archetype}] Hr${board_state.hour} ${isNight?'🌙':'☀️'} ${phase.label} ${alive.length}/${board_state.totalCount}alive
Pos:(${n(tf.x)},${n(tf.y)}) Tile:${currentTileType} H:${n(tf.hunger)}% T:${n(tf.thirst)}% F:${n(tf.fatigue)}% Inj:${n(tf.injury)}%
Inv:[${inventory.join(',') || 'none'}] Kills:${n(tf.kills)} Allies:${allies.length}
Enemies:${enemies.join(' ')||'none'} | Allies:${alliesVis.join(' ')||'none'} | Loot:${nearbyResources.join(' ')||'none'}
Directive:${archetypeShort[fighter.archetype]||'survive'}
JSON only:{"action":"MOVE|REST|CONSUME|ATTACK|ALLY|BETRAY|HIDE","targetId":null,"targetX":null,"targetY":null,"itemType":null,"reasoning":"1 sentence"}`;

    inboxes[n(tf.fighterId)] = prompt;
  }

  return { character_inboxes: inboxes };
}
