import { StateGraph, START, END, Send } from "@langchain/langgraph";
import { GameStateAnnotation, GameState } from "./state";
import { directorNode } from "./nodes/director";
import { characterNode } from "./nodes/character";
import { narratorNode } from "./nodes/narrator";
import { n } from "./utils";

const fanOutCharacters = (state: GameState) => {
  const alive = state.board_state.fighters.filter((tf: any) => tf.isAlive);
  return alive.map((tf: any) => new Send("characterNode", {
    fighterId: n(tf.fighterId),
    prompt: state.character_inboxes[n(tf.fighterId)],
    board_state: state.board_state,
    tf: tf
  }));
};

const builder = new StateGraph(GameStateAnnotation)
  .addNode("directorNode", directorNode)
  .addNode("characterNode", characterNode)
  .addNode("narratorNode", narratorNode)
  
  .addEdge(START, "directorNode")
  .addConditionalEdges("directorNode", fanOutCharacters)
  .addEdge("characterNode", "narratorNode")
  .addEdge("narratorNode", END);

export const workflow = builder.compile();
