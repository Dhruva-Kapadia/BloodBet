# BloodBets Arena Rulebook v1.

## The Laws of the Grid

## 1. THE ARENA

## Grid

#### Size: randomly generated between 20×20 and 32× 32 per tournament

#### All 20 fighters spawn at least 5 tiles apart from each other

#### Tile types determine terrain effects (see Section 6). Environmental hazards are increased across the board.

#### Points of interest are generated on the grid, but only 2-3 of them are revealed across the map every 3 hours. This incentivizes characters to converge and provides opportunities for conflict.

## Time

#### 1 in-game hour = 1 real-time tick (15 seconds in demo, configurable)

#### Each fighter gets exactly 1 action per hour

#### Game end condition is last man standing.

## The Hunger Clock

#### Every fighter faces a survival clock. Stats degrade every hour regardless of action:

```
Stat Degradation Per Hour Critical Threshold Death Threshold
Hunger +4 60 (HUNGRY) 100 (STARVED)
Thirst +6 60 (THIRSTY) 100 (DEHYDRATED)
Fatigue +3 70 (TIRED) 100 (COLLAPSED)
Injury No auto-increase 50 (INJURED) 100 (DEAD)
```
#### Death by stats is real. A fighter who avoids all combat can still die of thirst by Hour 17. This forces

#### every archetype — including cowards — to engage with the world.

## 2. MOVEMENT

## Rules


#### 8-directional movement — any adjacent tile including diagonals

#### Character movement limited to 1 grid point per hour, or 2 at the cost of 3x hunger gain for that hour.

#### Cannot move into WATER tiles (blocks movement)

#### Moving into DANGER tiles adds +5 Injury

### Visibility

#### 2-tile radius in daylight (Hours 6–19)

#### 1-tile radius at night (Hours 20–5)

#### FOREST tiles reduce enemy visibility of you by 1 tile

#### Intel Ping reveals all enemies within 4 tiles for 1 hour

### Movement Costs

```
Te r r a i n Fatigue Cost
PLAIN +
FOREST +
RUINS +
DANGER +4 + 5 Injury
SHELTER +
CORNUCOPIA +
```
## 3. ACTIONS

#### Each fighter chooses one action per hour from:

```
Action Description
MOVE Move 1 tile in any of 8 directions
ATTACK Attack a visible enemy
ALLY Propose alliance to a visible fighter
NEGOTIATE Attempt to negotiate with a visible fighter
TRADE Offer a resource to a visible fighter
```

```
BETRAY Turn on a current ally
FLEE Attempt to escape from a visible threat
CONSUME Use a resource from inventory
REST Recover fatigue (-15 in shelter, -8 in open)
HIDE Reduce your visibility radius by 1 for 1 hour
SET_TRAP Place a trap on current tile (requires Trap Kit)
IGNORE Do nothing — observe
```
## 4. COMBAT SYSTEM

### When Combat Triggers

#### Combat occurs when two fighters are on the same tile or within 1 tile and one chooses ATTACK.

### Combat Resolution Formula

```
Attacker Power = (Strength × 2) + (Speed × 0.5) + WeaponBonus + ConditionModifier
Defender Power = (Strength × 1.5) + (Speed × 1) + ArmorBonus + ConditionModifier
Win Chance = AttackerPower / (AttackerPower + DefenderPower) × 100
```
#### Weapon Bonus: +20 if armed Armor Bonus: +15 if wearing armor Condition Modifiers:

```
Condition Combat Modifier
STABLE 0
HUNGRY -
THIRSTY -
TIRED -
INJURED -
CRITICAL -
HIDDEN +10 (surprise)
```
### Outcomes

```
Result Winner Gets Loser Gets
```

```
Attacker wins Loser ’s inventory Eliminated
Defender wins Keeps inventory Attacker takes +25 Injury
Draw (within 5%) Both take +10 Injury Both take +10 Injury
```
### Traps

#### Placed with Trap Kit

#### Triggers on any fighter entering the tile (including allies if Betrayer)

#### Effect: +30 Injury + drops a random item from inventory

#### Visible to fighters with 2+ Intelligence after entering the tile (too late)

## 5. CONTACT RESOLUTION

#### When two fighters enter each other’s field of vision, the weighted decision system fires:

### Action Weights by Archetype

```
Action AGGRESSIVE STRATEGIC COWARDLY DIPLOMATIC BETRAYER SURVIVALIST
ATTACK 70 15 5 5 20 10
ALLY 5 20 15 50 40 15
NEGOTIATE 5 25 20 30 25 20
TRADE 5 15 10 35 10 20
FLEE 5 15 45 5 0 25
IGNORE 10 10 5 5 5 10
```
### Weight Modifiers (applied on top of base weights)

```
Situation Effect
Enemy has weapon ATTACK –20, FLEE +
Self is INJURED/CRITICAL ATTACK –30, FLEE +
Enemy is CRITICAL ATTACK +
Past betrayal by this fighter ATTACK +40, ALLY –
Current ally BETRAY weight activates (see below)
```

```
Self has no resources TRADE –20, NEGOTIATE +
Enemy same archetype NEGOTIATE +
Arena hour > 30 (late game) ATTACK +15 for all archetypes
```
### The Betrayal Trigger

#### Betrayal is only available to current allies. Weights:

```
Archetype Betrayal Base Weight Activates When
BETRAYER 40 Ally has weapons/resources OR late game
AGGRESSIVE 15 Ally is injured
STRATEGIC 10 Betrayal gives clear survival advantage
All others 2 Near-death survival only
```
#### Even cowards must fight eventually. If a fighter reaches Hour 20 and has no resources and is

#### HUNGRY + THIRSTY, their FLEE and IGNORE weights are cut in half. Survival instinct overrides

#### personality.

## 6. ARENA TILES

```
Tile Effect
PLAIN No modifiers
FOREST +1 stealth, –1 enemy visibility of you
WATER Impassable. Adjacent tiles: can CONSUME water (removes thirst)
RUINS 30% chance of finding a random resource. +5 Injury risk per hour rested here
CORNUCOPIA Spawns with 5 random resources. High-traffic, high-risk
SHELTER REST recovery doubled. –1 fatigue per hour passively
DANGER +5 Injury per hour. Resources spawn here frequently
```
## 7. R E S O U R C E S

### Inventory


#### Maximum 4 items per fighter

#### Items can be dropped, traded, stolen, or consumed

#### Dropping an item leaves it on the current tile

### Resource Effects

```
Resource Effect Notes
FOOD –40 Hunger Can be rationed (–20) for 2 uses
WATER –50 Thirst Most urgent resource
MEDKIT –40 Injury Rare. Cannot revive from 100
WEAPON +20 Combat Bonus Only 1 active at a time
ARMOR +15 Defense Bonus Only 1 active at a time
SMOKE_BOMB FLEE always succeeds Single use, removes from inventory
TRAP_KIT Place 1 trap Consumed on placement
INTEL_PING Reveal all enemies in 4 tiles Lasts 1 hour
```
### Trade Rules

#### Trade is always voluntary — both fighters must agree (or Diplomatic archetype proposes, other

#### accepts/rejects)

#### Stealing: ATTACK action while enemy is resting/hidden — winner takes 1 random item

#### Sponsor drops: land 1 tile away from the target fighter, can be intercepted by any nearby fighter

## 8. ALLIANCES

### Formation

#### Must be mutually agreed (both fighters choose ALLY in same tick, or one proposes and other

#### accepts next tick)

#### Maximum alliance size: 3 fighters

#### Alliance members cannot attack each other directly (unless BETRAY is chosen)

### Alliance Benefits

#### Shared visibility range (see what allies see)


#### Cannot be targeted by each other’s traps

#### Coordinated attacks: if 2 allies attack same target, each gets +15 Combat Bonus

### Betrayal Consequences

#### Betrayed fighter takes +20 Injury instantly

#### Betrayed fighter gains HUNTED condition against betrayer (+15 attack weight vs betrayer

#### permanently)

#### Betrayer gets TRAITOR flag visible to all bettors

## 9. FORCED COMBAT RULE

#### No fighter can avoid all combat forever.

#### The Game Master should drive the game to have at least one interaction for every character every 12 hours.

#### If a fighter has gone 10+ consecutive hours without any combat interaction (attack, flee, negotiate, or

#### be attacked):

#### Their FLEE and IGNORE weights are reduced by 50%

#### Their ATTACK and NEGOTIATE weights increase by 30%

#### This resets after any combat interaction

#### This ensures bettors always see action. The arena forces confrontation.

## 10. STAT POINTS & XP SYSTEM

#### Fighters earn Career XP that improves their base stats over time across tournaments.

### XP Events

```
Event XP Earned
Survive 1 full in-game day (24 hours) +50 XP
Win a combat +75 XP
Successfully negotiate (no fight) +30 XP
Collect 3+ resources in a tournament +25 XP
Form a successful alliance +20 XP
Betray an ally and survive +40 XP
Win the tournament +200 XP
```

```
Die in combat (participated) +15 XP
Die by stats (starved/dehydrated) +0 XP
Eliminate the tournament winner +100 XP
Sponsor item successfully claimed +10 XP (to fighter)
```
### XP → Stat Upgrades

#### Every 100 XP = 1 stat point to assign. Points are assigned automatically based on archetype:

```
Archetype Priority Stats
AGGRESSIVE Strength → Speed → Luck
STRATEGIC Intelligence → Luck → Speed
COWARDLY Speed → Luck → Intelligence
DIPLOMATIC Charisma → Intelligence → Luck
BETRAYER Charisma → Intelligence → Speed
SURVIVALIST Luck → Intelligence → Speed
```
#### Maximum stat cap: 10 per stat (base max is 5 at creation)

## 11. WIN CONDITIONS

### To u r n a m e n t W i n n e r

#### Last fighter alive wins

#### Collects 60% of the prize pool

#### Earns +200 XP

#### Gets CHAMPION badge visible on their profile

### Runner-up (2nd to last standing)

#### Collects 20% of the prize pool

#### Earns +100 XP

### Special Achievements (visible to bettors, affect odds)

```
Achievement Trigger Odds Effect
```

```
FIRST BLOOD First kill of tournament WIN odds –0.5x (more dangerous)
PACIFIST Reached top 3 without killing WIN odds +2x (unlikely)
BETRAYER Betrayed an ally ALLIANCE bet odds +3x
CORNUCOPIA KING Grabbed 3+ items from Cornucopia MOST_KILLS odds –1x
GHOST Never entered enemy vision DIES_FIRST odds +5x
SURVIVOR Reached Hour 48 SURVIVES_DAY_1 bet auto-wins
```
## 12. BETTOR INFORMATION

#### Bettors can see the following before and during a tournament:

### Pre-Tournament (Lobby)

#### Fighter archetype and lore

#### All 5 base stats

#### Career record (tournaments, wins, XP level)

#### Current XP-upgraded stats

#### Achievement badges from past tournaments

#### Computed survival odds (based on stats + archetype)

### During Tournament (Live)

#### Fighter’s current tile position on the grid

#### Current condition (STABLE / HUNGRY / THIRSTY / INJURED etc.)

#### Inventory contents

#### Current alliances

#### All combat/alliance/betray events in the live feed

#### Inner monologue snippets from AI decisions

#### Sponsor drop status

### Hidden from Bettors

#### Exact hunger/thirst/fatigue numbers (only condition label shown)

#### Other fighters’ exact positions (only visible if in vision)


#### Trap locations

#### Studying fighters matters. A DIPLOMATIC fighter with high Charisma is likely to form alliances —

#### bet FORMS_ALLIANCE. An AGGRESSIVE fighter with a weapon in a small arena will hunt — bet

#### MOST_KILLS. A SURVIVALIST with high Luck who avoids the Cornucopia might outlast everyone —

#### bet WIN at long odds.

## 13. DIFFICULTY SCALING

#### The arena gets harder as fighters dwindle:

```
Fighters Remaining Thirst Degradation Hunger Degradation Arena Shrink
20–15 +6/hr +4/hr None
14–10 +8/hr +5/hr None
9–5 +10/hr +6/hr Danger tiles expand
4–2 +12/hr +8/hr Safe tiles removed
Final 2 +15/hr +10/hr Only PLAIN and DANGER remain
```
#### The endgame is brutal. Two survivors in a shrinking arena, both starving, both injured. Someone

#### has to make a move.

#### This rulebook governs the BloodBets simulation engine. All AI decisions are driven by personality

#### weights, stat modifiers, and survival pressure. No fighter is scripted — every outcome emerges from

#### the system.


