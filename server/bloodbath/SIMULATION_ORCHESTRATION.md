# Multi-Agent Simulation Orchestration

This document details the architecture of the **LangGraph Multi-Agent System (MAS)** that drives the BloodBet game simulation. 

## Overview
Previously, the orchestrator evaluated the game state and executed a flat mapping over all characters, feeding each a single, localized prompt to make a decision. 

The new orchestration utilizes a LangGraph workflow. It splits the cognitive responsibilities of the game into three distinct agent roles:
1. **The Game Master (Director):** Observes the absolute board state, determines what each character perceives (Fog of War), and generates psychological or sensory events.
2. **The Characters:** Independent AIs that maintain their own memory (alliances, grudges, recent events), receive sensory input from the Director, and choose a mechanical action.
3. **The Game Master (Narrator):** Observes the mechanical outcomes of the characters' actions and translates them into a dynamic, dramatic broadcast for the players and bettors.

Crucially, **SpacetimeDB remains the definitive physics engine (Referee)**. The AIs do not determine whether an attack hits or how much damage it does; they only submit their *intent* to the engine, which executes the math deterministically.

---

## Architectural Flow

The simulation runs in a cyclic graph (StateGraph) governed by LangGraph. Each "tick" (in-game hour) executes the following sequence:

### 1. State Initialization
The current mechanical state of the game (positions, health, inventory) is pulled from SpacetimeDB and injected into the **Graph State**.

### 2. The Director Node
**Input:** Global `board_state`
- Analyzes the board.
- Determines line-of-sight and auditory events.
- Generates a personalized "sensory payload" for each alive character (e.g., "You hear a snap to the East" or "You see Fighter B bleeding heavily").
**Output:** Populates `character_inboxes` (a mapping of `fighterId` to sensory strings).

### 3. Fan-Out to Character Nodes (Map-Reduce)
Using LangGraph's `Send` API, the graph forks into parallel execution paths, one for each alive fighter.
**Input:** The character's specific `inbox` message and their personal `board_state` slice.
- The Character AI roleplays their response to the current situation.
- The Character AI references past interactions from a Checkpointer/Memory layer to honor alliances or hold grudges.
- The Character AI outputs a strict JSON action intent (e.g., `{"action": "ATTACK", "targetId": 4}`).
**Output:** Each node returns a `CharacterDecision` which is aggregated back into the main state's `character_decisions` map.

### 4. Engine Synchronization Node
**Input:** `character_decisions`
- Submits the aggregated decisions to SpacetimeDB via the `conn.reducers.advanceHour()` method.
- **Yields execution** until SpacetimeDB processes the actions, resolves the physics/math, and emits the updated board state and action logs.
**Output:** Overwrites `board_state` with the new post-resolution state, and records `recent_events` (the raw logs of who hit whom, who died, etc.).

### 5. The Narrator Node
**Input:** `recent_events` and the new `board_state`.
- Weaves the dry, mechanical logs into a rich narrative string.
- (Example: Raw Log "Fighter A hit Fighter B for 15 damage" becomes Narrative "Fighter A ambushed Fighter B in the dense brush, landing a crippling blow.")
**Output:** Updates the `global_narrative` property in the graph state, which is subsequently broadcasted to the frontend UI.

---

## Graph State Definition

The data payload passed between nodes in the LangGraph application:

```typescript
interface GameState {
  tournamentId: number;
  
  // Deterministic state from SpacetimeDB
  board_state: any; 
  
  // Mechanical event logs from the Engine Sync step
  recent_events: any[]; 
  
  // The GM's dramatic interpretation of the hour
  global_narrative: string; 
  
  // GM Director's messages to specific characters
  character_inboxes: Record<number, string>; 
  
  // Characters' chosen mechanical actions
  character_decisions: Record<number, any>; 
}
```

## Benefits of this Architecture
- **Emergent Storytelling:** Characters react to nuanced events and flavor text, rather than just grid coordinates.
- **Parallel Processing:** Utilizing LangGraph's Send API guarantees we query the LLM for every character concurrently, drastically reducing the turnaround time for an hour of simulation.
- **Robustness:** LLMs are prone to hallucinating game rules. By strictly using SpacetimeDB as a mechanical referee, we prevent AIs from "teleporting" or spawning items out of thin air. The AI decides *what* to attempt, but the Engine decides if it *succeeds*.
