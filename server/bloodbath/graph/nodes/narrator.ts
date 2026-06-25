import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { GameState } from "../state";
import { groqLimiter } from "../utils";

const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  modelName: "llama-3.3-70b-versatile",
  temperature: 0.7,
  maxTokens: 150,
});

export async function narratorNode(state: GameState): Promise<Partial<GameState>> {
  const { board_state, character_decisions } = state;
  const hour = board_state.hour;
  
  // Convert decisions into a prompt for the narrator
  const decisionSummary = Object.entries(character_decisions).map(([id, dec]: [string, any]) => {
    const name = board_state.fighters.find((f: any) => Number(f.fighterId) === Number(id))?.fighterData?.name || `Fighter ${id}`;
    return `${name} decided to ${dec.action}: "${dec.reasoning}"`;
  }).join('\n');

  if (!decisionSummary) {
    return { global_narrative: `Hour ${hour} passes in eerie silence.` };
  }

  const prompt = `You are the Game Master narrating a battle royale.
Current Hour: ${hour}.
Alive fighters: ${board_state.fighters.filter((f: any) => f.isAlive).length} / ${board_state.totalCount}

Here are the actions the fighters just took:
${decisionSummary}

Write a dramatic 2-3 sentence summary of the hour's events for the audience.`;

  try {
    await groqLimiter.acquire();
    const res = await llm.invoke([
      new SystemMessage('You are a dramatic narrator. Be concise and engaging.'),
      new HumanMessage(prompt)
    ]);
    return { global_narrative: res.content.toString() };
  } catch (err: any) {
    console.error("Narrator failed:", err.message);
    return { global_narrative: `Hour ${hour} concludes with unseen violence and quiet survival.` };
  }
}
