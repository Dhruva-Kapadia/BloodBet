import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { GameState, BoardState } from "../state";
import { n, getUrgentNeed, nearestResource, stepToward, clamp, groqLimiter } from "../utils";

const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  modelName: "llama-3.3-70b-versatile",
  temperature: 0.75,
  maxTokens: 80,
  maxRetries: 2,
});

export interface CharacterActState {
  fighterId: number;
  prompt: string;
  board_state: BoardState;
  tf: any;
}

export async function characterNode(state: CharacterActState): Promise<Partial<GameState>> {
  const { fighterId, prompt, board_state, tf } = state;
  const fighter = tf.fighterData;
  const base = { fighterId, targetId: null, targetX: null, targetY: null, itemType: null };
  const inv: string[] = JSON.parse(tf.inventory ?? '[]');
  const urgent = getUrgentNeed(tf);

  let decision: any = null;

  // Obvious decisions skip LLM
  if (urgent === 'REST') {
    decision = { ...base, action: 'REST', reasoning: 'I must rest.' };
  } else if (urgent && inv.includes(urgent)) {
    decision = { ...base, action: 'CONSUME', itemType: urgent, reasoning: `Using ${urgent} now.` };
  } else {
    try {
      await groqLimiter.acquire();
      const res = await llm.invoke([
        new SystemMessage('Battle royale AI. Reply ONLY with valid JSON, no markdown.'),
        new HumanMessage(prompt)
      ]);
      const raw = res.content.toString() ?? '{}';
      const match = raw.replace(/```json|```/g, '').match(/\{[\s\S]*\}/);
      if (!match) throw new Error('No JSON');
      decision = { fighterId, ...JSON.parse(match[0]) };
    } catch (err: any) {
      console.error(`  ❌ AI failed for ${fighter?.name}:`, err?.message ?? err);
      decision = smartFallback(tf, board_state);
    }
  }

  const validDecision = validateDecision(decision, tf, board_state, inv);

  return {
    character_decisions: {
      [fighterId]: validDecision
    }
  };
}

function smartFallback(tf: any, board_state: BoardState): any {
  const base = { fighterId: n(tf.fighterId), targetId: null, targetX: null, targetY: null, itemType: null };
  const inv: string[]  = JSON.parse(tf.inventory ?? '[]');
  const urgent         = getUrgentNeed(tf);
  const allies: number[] = JSON.parse(tf.alliances ?? '[]');

  if (urgent === 'REST') return { ...base, action: 'REST', reasoning: 'I must rest to survive.' };
  if (urgent && inv.includes(urgent)) return { ...base, action: 'CONSUME', itemType: urgent, reasoning: `I consume ${urgent} before it is too late.` };

  const resourceTarget = urgent ? nearestResource(board_state.tiles, n(tf.x), n(tf.y), urgent) : null;
  if (resourceTarget) {
    const step = stepToward(n(tf.x), n(tf.y), resourceTarget.x, resourceTarget.y);
    return { ...base, action: 'MOVE', targetX: clamp(step.x, 0, board_state.gridW - 1), targetY: clamp(step.y, 0, board_state.gridH - 1), reasoning: `I head toward ${urgent} at (${resourceTarget.x},${resourceTarget.y}).` };
  }

  return { ...base, action: 'HIDE', reasoning: 'I lay low and observe.' };
}

function validateDecision(d: any, tf: any, board_state: BoardState, inventory: string[]): any {
  d = { ...d };
  const visibleFighters = board_state.fighters.filter(other => 
    other.isAlive && n(other.fighterId) !== n(tf.fighterId) &&
    Math.abs(n(other.x) - n(tf.x)) <= 2 && Math.abs(n(other.y) - n(tf.y)) <= 2
  );

  if (['ATTACK', 'ALLY', 'BETRAY', 'NEGOTIATE', 'TRADE'].includes(d.action)) {
    const valid = visibleFighters.some(f => n(f.fighterId) === n(d.targetId));
    if (!valid) {
      if (d.action === 'ATTACK') {
        const allies: number[] = JSON.parse(tf.alliances ?? '[]');
        const enemy = visibleFighters.find(f => !allies.includes(n(f.fighterId)));
        if (enemy) { d.targetId = n(enemy.fighterId); }
        else { d.action = 'WORLD_EVENT'; d.targetId = null; d.reasoning = 'A wild predator attacks from the shadows.'; }
      } else {
        d.action = 'REST'; d.targetId = null;
      }
    }
  }

  if (d.action === 'WORLD_EVENT') {
     d.targetId = null;
  }

  if (d.action === 'CONSUME') {
    if (!d.itemType || !inventory.includes(d.itemType)) {
      const useful = ['WATER', 'FOOD', 'MEDKIT'].find(i => inventory.includes(i));
      if (useful) d.itemType = useful;
      else { d.action = 'HIDE'; d.itemType = null; }
    }
  }

  if (d.action === 'MOVE') {
    if (d.targetX == null || d.targetY == null) {
      d.action = 'REST';
    } else {
      const tx = clamp(n(d.targetX), 0, board_state.gridW - 1);
      const ty = clamp(n(d.targetY), 0, board_state.gridH - 1);
      const dx = tx - n(tf.x), dy = ty - n(tf.y);
      const dist = Math.min(2, Math.max(Math.abs(dx), Math.abs(dy)));
      const adjX = clamp(n(tf.x) + Math.sign(dx) * Math.min(dist, Math.abs(dx)), 0, board_state.gridW - 1);
      const adjY = clamp(n(tf.y) + Math.sign(dy) * Math.min(dist, Math.abs(dy)), 0, board_state.gridH - 1);
      d.targetX = adjX; d.targetY = adjY;
    }
  }

  return d;
}
