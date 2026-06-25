import { Annotation } from "@langchain/langgraph";

export interface BoardState {
    fighters: any[];
    tiles: any[];
    aliveCount: number;
    totalCount: number;
    hour: number;
    gridW: number;
    gridH: number;
}

export const GameStateAnnotation = Annotation.Root({
  tournamentId: Annotation<number>,
  
  // Deterministic state from SpacetimeDB
  board_state: Annotation<BoardState>, 
  
  // Mechanical event logs from the Engine Sync step (who hit whom, who died, etc.)
  recent_events: Annotation<any[]>({
    reducer: (curr, update) => update,
    default: () => []
  }),
  
  // The GM's dramatic interpretation of the hour
  global_narrative: Annotation<string>({
    reducer: (curr, update) => update,
    default: () => ""
  }),
  
  // GM Director's messages to specific characters
  character_inboxes: Annotation<Record<number, string>>({
    reducer: (curr, update) => ({ ...curr, ...update }),
    default: () => ({})
  }),
  
  // Characters' chosen mechanical actions. Reducer merges the updates from parallel nodes.
  character_decisions: Annotation<Record<number, any>>({
    reducer: (curr, update) => ({ ...curr, ...update }),
    default: () => ({})
  }),
});

export type GameState = typeof GameStateAnnotation.State;
