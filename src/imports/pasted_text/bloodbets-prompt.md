Here's your full Figma AI prompt — written to be maximally detailed, evocative, and technically specific so Figma's AI (or a designer) can execute every screen with precision:

---

## 🎮 FIGMA PROMPT: **BLOODBETS — The Hunger Games Prediction Platform**

---

**PROJECT NAME:** BloodBets
**TAGLINE:** *"Bet on survival. Own the arena."*

---

### 🎨 VISUAL IDENTITY & AESTHETIC DIRECTION

**Theme:** Dark dystopian luxury. Imagine if HBO's *Succession* met *The Hunger Games* Capitol aesthetic. Rich, opulent, dangerous. This is a world where wealthy elites watch gladiatorial AI combat and gamble fortunes on it. The UI should feel like a private members-only betting club crossed with a war room.

**Color Palette:**
- Background Primary: `#0A0A0B` (near black)
- Background Secondary: `#111114` (card surfaces)
- Background Tertiary: `#1A1A1F` (elevated panels)
- Accent Gold: `#C9A84C` (primary CTA, highlights, currency)
- Accent Crimson: `#8B1A1A` → `#D42B2B` gradient (danger, death, eliminations)
- Accent Ice Blue: `#4A9EFF` (ally indicators, safe states)
- Text Primary: `#F0EDE6` (warm white, like aged parchment)
- Text Secondary: `#8A8A92`
- Success Green: `#2ECC71` (wins, earnings)
- Separator: `rgba(201, 168, 76, 0.15)` (gold hairlines)

**Typography:**
- Display/Headings: **"Cinzel Decorative"** — Roman numeral/monument energy, all caps drama. For tournament names, hero titles.
- Sub-headings/Labels: **"Rajdhani"** — condensed, technical, military.
- Body/Data: **"IBM Plex Mono"** — stats, odds, numbers. Feels like a war terminal.
- Accent Italic: **"Cormorant Garamond Italic"** — for character lore, quotes, backstory text. Aristocratic.

**Visual Details:**
- Noise/grain overlay at 4% opacity across all surfaces
- Subtle scanline texture on dark backgrounds (think CRT monitor glow)
- Red blood-splatter SVG watermarks used sparingly as decorative elements (abstract, not gore)
- Gold foil shimmer effect on tournament trophy icons (CSS shimmer animation)
- All cards have a subtle inner glow border: `box-shadow: inset 0 0 0 1px rgba(201,168,76,0.2)`
- Diagonal slash dividers between sections (clip-path geometry)
- Parallax depth on hero sections — foreground/mid/background layers

---

### 📄 PAGES TO DESIGN (IN ORDER)

---

#### **PAGE 1 — LANDING PAGE (Pre-login)**

**Hero Section:**
Full-viewport dark cinematic hero. Background: slow looping abstract particle battle animation — particles representing "tributes" moving, colliding, disappearing. Over this, a large bold headline:

```
CINZEL DECORATIVE, 96px, gold:
"ONLY ONE
SURVIVES."
```

Subheadline in Cormorant Garamond Italic 22px warm white:
*"50 AI gladiators. 20 enter the arena. One walks out. Where do you place your faith?"*

Two CTAs side by side:
- Primary button: `[ENTER THE ARENA]` — gold background, black text, sharp rectangle, no border-radius, slight glow
- Secondary button: `[WATCH LIVE]` — transparent, gold border 1px, gold text, hover fills gold

Floating badge top-right: `🔴 LIVE NOW — Tournament #47 · Round 3 of 5` — pulsing red dot

**Feature Strip (below hero, horizontal scroll on mobile):**
4 dark cards with gold icon + headline:
1. 🎯 **"Precision Bets"** — Round-by-round survival odds
2. 🤝 **"Sign Contracts"** — Own a fighter across 3 tournaments
3. ⚙️ **"Build Your AI"** — Design and deploy your own gladiator
4. 🏟️ **"Host Arenas"** — Become the Game Master

**Live Tournament Preview Section:**
Title: `ACTIVE TOURNAMENT — TOURNAMENT #47: "THE CRIMSON SEASON"`

Show a mini arena bracket-style view — 20 character avatars arranged in a 4×5 grid, with elimination indicators (skulls over dead ones, fire icons over survivors). Clicking one expands a character card. Shows:
- Round progress bar (Round 3 of 5)
- Current odds
- Total bet pool: `$284,490`
- Top bettor: `@voidhunter_x · $12,000 on IRON_CIPHER`

**How It Works — 3-step section:**
Diagonal-cut dark section, 3 numbered steps in Rajdhani:
1. **ANALYZE** — Study character profiles, stats, histories
2. **BET** — Place multi-type bets before and during rounds
3. **ASCEND** — Win capital, sign contracts, build fighters, host tournaments

**Leaderboard Teaser:**
Top 5 Game Masters with gold crowns, tournament count, total hosted prize pools

**Footer:**
Dark, minimal. Logo left. Nav links center. Tagline right: *"The Capitol watches. Do you?"*

---

#### **PAGE 2 — LOGIN / SIGNUP PAGE**

**Layout:** Split-screen — left 55%, right 45%

**Left Panel:**
Full dark background with an atmospheric character silhouette (faceless, armored, dramatic backlit). Over it:
- Logo top-left: a stylized flame-within-a-circle mark + "BLOODBETS" in Cinzel
- Large quote in Cormorant Garamond Italic:
  *"In the arena, only the prepared survive. Are you prepared to profit?"*
- Below: 3 live stats animating up:
  - `$4.2M` — Total payout this season
  - `12,847` — Active bettors
  - `50` — Unique AI fighters

**Right Panel:**
Dark surface `#111114`, centered vertically

Tabs: `[LOG IN]` / `[CREATE ACCOUNT]` — gold underline active tab

**Login Form:**
- Label: "ARENA ID (EMAIL)" in Rajdhani caps, 11px, gold letter-spacing
- Input: dark `#1A1A1F`, 1px gold border, IBM Plex Mono text, no border-radius
- Label: "ACCESS CODE (PASSWORD)"
- Input: same style, eye-toggle icon in gold
- "FORGOT YOUR CODE?" — small gold link, right-aligned
- CTA: `[ENTER THE ARENA]` — full-width gold button, black text, Rajdhani 14px caps
- Divider: `— OR —` with gold hairlines
- Google OAuth button: dark bordered, white text, Google icon

**Signup Form (toggled):**
- USERNAME (3-24 chars, monospace preview)
- EMAIL
- PASSWORD + CONFIRM PASSWORD
- Starting balance display: `💰 $100.00 WELCOME BONUS` — animated gold counter
- Checkbox: "I accept the Arena Terms & Survival Policy"
- CTA: `[JOIN THE BLOODBETS]`

---

#### **PAGE 3 — MAIN DASHBOARD (Post-login)**

**Top Navigation Bar:**
Dark `#0A0A0B`, full-width, sticky
- Left: BloodBets logo
- Center nav links: `TOURNAMENTS · FIGHTERS · MY BETS · CONTRACTS · MY FIGHTERS · LEADERBOARD`
- Right: `💰 $2,450.00` wallet balance (gold, pulsing when updated) + Avatar + Notification bell (red dot if active)

**Hero Banner — Active Tournament:**
Large card spanning full width, dark crimson gradient background, showing:
- Tournament name: `"TOURNAMENT #47: THE CRIMSON SEASON"`
- Status badge: `🔴 ROUND 3 LIVE`
- Arena type: `❄️ ARCTIC WASTELAND`
- Participants: 8 surviving / 20 started
- Prize pool: `$284,490`
- Your bet status: `✅ You bet $200 on IRON_CIPHER to win — Current odds: 3.2x`
- Button: `[WATCH LIVE]` + `[PLACE MORE BETS]`

**Dashboard Grid (below hero) — 3 column:**

*Column 1:*
- **MY WALLET** card: Balance `$2,450`, graph of balance over time (sparkline), deposit/withdraw buttons
- **ACTIVE BETS** card: List of current bets with live status indicators

*Column 2:*
- **UPCOMING TOURNAMENTS** card: 2-3 tournament cards with countdown timers, character previews, enter/view buttons
- **QUICK BET** card: Enter amount + pick a character from dropdown + bet type — one-click

*Column 3:*
- **MY CONTRACTS** card: Show contracted fighter avatar + remaining tournaments (e.g., `2/3 remaining`) + earnings so far
- **LEADERBOARD SNAPSHOT** card: Top 5 users with rank, username, tournament count, capital

---

#### **PAGE 4 — TOURNAMENT LOBBY (Before tournament starts)**

**Header:**
Tournament title, countdown timer (large, Cinzel, red), arena type badge, total prize pool

**Character Grid — 20 Fighters:**
4×5 grid of character cards. Each card:
- Dark `#1A1A1F` with gold hairline border
- Character avatar (stylized, abstract portrait — not realistic faces)
- Name in Cinzel: e.g., `IRON_CIPHER`
- Lore type tag: `STRATEGIST · LONE WOLF · BETRAYER`
- Key stats in IBM Plex Mono:
  - **STR** ████░ 4/5
  - **SPD** ███░░ 3/5
  - **INT** █████ 5/5
  - **LUCK** ██░░░ 2/5
- Survival odds: `38% to survive Round 1`
- Win odds: `12.4x`
- `[BET ON THIS FIGHTER]` button — appears on hover

Clicking a card opens a **Character Profile Modal:**
- Full backstory in Cormorant Garamond Italic
- Win history (past tournaments participated, placements)
- Personality traits (e.g., "Forms alliances early, betrays by Round 3")
- All available bets for this character:
  - Survives Round 1 — `1.4x`
  - Dies first — `22x`
  - Wins tournament — `12.4x`
  - Kills 3+ opponents — `5x`
  - Forms alliance — `2.1x`
- Bet input + `[CONFIRM BET]`

**Bet Panel (right sidebar or bottom drawer):**
My pending bets list — character, bet type, amount, potential payout. `[CONFIRM ALL BETS]` CTA.

---

#### **PAGE 5 — LIVE TOURNAMENT VIEW**

**Layout:** Cinematic. Dark full-bleed.

**Top Bar:** Round indicator `ROUND 3 OF 5 · 8 SURVIVORS REMAINING · 00:04:23 remaining`

**Arena View (Center):**
Abstract arena visualization — top-down hexagonal grid map with character tokens on it. Eliminated characters shown as faded skulls. Current alliances shown as glowing lines between tokens. Events appear as animated bursts.

**Live Event Feed (Right sidebar):**
Scrolling feed in IBM Plex Mono, timestamped:
```
[02:14] ⚔️  IRON_CIPHER eliminates SHADOW_BLOOM
[02:09] 🤝  VEXOR_9 forms alliance with NULLBORN
[01:58] 💀  ECHO_FANG eliminated — BETRAYED
[01:47] 🏃  PRISM_WILD flees trap in SECTOR 4
```
Each event color-coded: red=death, gold=alliance, blue=survival, white=movement

**My Bets Panel (Left sidebar):**
Your bets — live status, current odds (updating), potential payout

**Character Status Grid (Bottom):**
Small avatar strip showing all 20 characters — grey/skull = dead, glowing = alive, fire = in danger

---

#### **PAGE 6 — CHARACTER PROFILES DIRECTORY**

**Header:** `THE 50 FIGHTERS` in massive Cinzel. Subtitle: *"Study them. Understand them. Profit from them."*

**Filter Bar:**
- Filter by: Role (Strategist / Brute / Spy / Medic / Wildcard)
- Filter by: Stat dominance (Strength / Speed / Intelligence)
- Sort by: Win rate / Popularity / Contract availability

**Fighter Grid:**
5-column grid of fighter cards (similar to lobby but richer):
- More detailed stat bars
- "Career Stats" pill badges: `14 tournaments · 3 wins · 47% survival rate`
- Available for contract indicator (gold badge)
- `[VIEW PROFILE]` / `[CONTRACT AUCTION]` buttons

---

#### **PAGE 7 — CONTRACT AUCTION PAGE**

**Header:** `CONTRACT AUCTION HOUSE` in Cinzel. Subtext: *"Own a fighter. Share their glory."*

**Auction Listings:**
Cards for fighters available for contract. Each card shows:
- Fighter portrait + name
- Career stats
- Current auction bid: `$1,240`
- Time remaining: `04:32:11`
- Bid input + `[PLACE BID]`
- Contract terms badge: `3 Tournaments · Revenue Share: 100% of winnings`
- Your current bid status if you've already bid

**My Contracts section below:**
Active contracts panel — fighter, tournaments remaining, total earned

---

#### **PAGE 8 — BUILD YOUR AI FIGHTER**

**Header:** `FORGE YOUR FIGHTER` in Cinzel. Gold sparks decorative element.

**Builder Interface — Wizard-style, 4 steps:**

*Step 1 — IDENTITY:*
- Fighter name input (Rajdhani preview of name as you type)
- Lore/backstory textarea (Cormorant Garamond preview)
- Select archetype: STRATEGIST / BRUTE / SPY / MEDIC / WILDCARD (icon cards)

*Step 2 — STATS:*
5 sliders (drag to allocate 15 total points):
- STRENGTH / SPEED / INTELLIGENCE / LUCK / CHARISMA
- Visual: pentagon radar chart updates in real-time as you drag

*Step 3 — TRAITS:*
Select 3 personality traits from a grid (e.g., "Forms alliances," "Betrays at 50% health," "Never retreats"):
- Trait cards with effect descriptions

*Step 4 — APPEARANCE:*
Avatar selector — abstract generative portrait options (8 options, geometric/stylized)

**Summary Panel (right):**
Live preview of fighter card as it'll appear in tournaments

**CTA:** `[DEPLOY FIGHTER — COST: $500]`

---

#### **PAGE 9 — HOST A TOURNAMENT (Unlocked at 10 fighters)**

**Header:** `THE GAME MASTER'S CHAMBER` with a crown icon

**Tournament Builder:**

*Section 1 — BASICS:*
- Tournament name
- Theme/lore description

*Section 2 — ARENA:*
Pick from: ARCTIC WASTELAND / JUNGLE LABYRINTH / VOLCANIC PEAKS / URBAN RUINS / DEEP OCEAN / DESERT COLOSSEUM
Each shown as a dark card with atmospheric art + stat modifiers (e.g., "Arctic: SPD -1 for all")

*Section 3 — ROUNDS:*
Set number of rounds (3–7). For each round, choose:
- Obstacle type (Trap / Combat / Survival challenge / Resource scarcity)
- Elimination rule (How many die per round)

*Section 4 — FIGHTER SELECTION:*
Toggle: `[RANDOM 20 FROM POOL]` or `[MANUAL SELECT]`
If manual: checkboxes on character thumbnails

*Section 5 — RULES:*
Toggle switches for:
- Allow alliances
- Allow betrayals
- Double-elimination rounds
- Wildcard events

*OR toggle:* `[LET THE AI DECIDE EVERYTHING]` — gold toggle, fills all fields with AI-generated content

**Preview Summary:** Right panel showing full tournament brief

**CTA:** `[LAUNCH TOURNAMENT — COST: $1,000]`

---

#### **PAGE 10 — LEADERBOARD**

**Header:** `HALL OF GAME MASTERS` in full Cinzel, gold, large

**Top 3 — Podium Style:**
#1 center (tallest), #2 left, #3 right — each with:
- Crown/medal icon
- Avatar
- Username in Cinzel
- Tournaments hosted
- Total prize pool managed
- Top fighter created

**Full Table below:**
Ranked list — rank, avatar, username, tournaments hosted, total earnings generated, total bettors attracted, status badge (ACTIVE / LEGENDARY / RISING)

**Tabs:** `TOP GAME MASTERS · TOP BETTORS · TOP FIGHTERS (by win rate)`

---

### 🔧 COMPONENT LIBRARY TO GENERATE

Also create a component sheet with all reusable elements:
- Primary/secondary/danger buttons (all states: default, hover, active, disabled)
- Input fields (default, focused, error, success)
- Fighter card (compact, expanded, modal)
- Bet card (pending, active, won, lost)
- Tournament card (upcoming, live, completed)
- Avatar + badge combos
- Stat bar component
- Gold/crimson notification toasts
- Navigation bar + mobile hamburger version
- Modal/drawer overlays
- Progress/round tracker component
- Odds pill badge
- Animated countdown timer
- Wallet balance widget

---

### 📱 RESPONSIVE NOTES

- Mobile: Bottom navigation bar replacing top nav. Character grid collapses to 2-column. Live feed becomes bottom drawer. All cards full-width.
- Tablet: 2-column grid layouts, collapsible sidebars.
- Desktop: Full experience as described above.

---

### ✨ MOTION & INTERACTION NOTES FOR FIGMA PROTOTYPING

- **Character card hover:** Slight upward lift + gold inner glow intensifies + `[BET]` button slides up from bottom
- **Round completion:** Full-screen dramatic flash (crimson) + elimination count
- **Wallet update (win):** Gold coin burst particle effect from balance number
- **Tournament bracket:** Eliminations show crossed-out animation
- **CTA buttons:** Press state = subtle scale down 0.97 + darkens
- **Page transitions:** Horizontal slide with gold trailing line
- **Loading states:** Arena-themed — spinning 6-pointed star in gold

---

This gives you everything you need — paste the whole thing into Figma AI, MagicPatterns, or hand it directly to a designer. The level of detail here means zero ambiguity on any screen.