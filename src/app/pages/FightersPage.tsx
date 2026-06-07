import { useState } from 'react';
import { NavBar } from '../components/NavBar';
import { StatBar } from '../components/StatBar';
import { Filter, Search, X, Trophy, Swords, Star, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useDB } from '../context/SpacetimeContext';

const ARCHETYPE_COLOR: Record<string, string> = {
  AGGRESSIVE:  'text-red-400 border-red-500/40 bg-red-500/10',
  STRATEGIC:   'text-blue-400 border-blue-500/40 bg-blue-500/10',
  COWARDLY:    'text-yellow-400 border-yellow-500/40 bg-yellow-500/10',
  DIPLOMATIC:  'text-green-400 border-green-500/40 bg-green-500/10',
  BETRAYER:    'text-purple-400 border-purple-500/40 bg-purple-500/10',
  SURVIVALIST: 'text-orange-400 border-orange-500/40 bg-orange-500/10',
};

const ARCHETYPE_ICON: Record<string, string> = {
  AGGRESSIVE: '⚔️', STRATEGIC: '🧠', COWARDLY: '🐇',
  DIPLOMATIC: '🤝', BETRAYER: '🗡️', SURVIVALIST: '🌿',
};

export function FightersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [archetypeFilter, setArchetypeFilter] = useState('All');
  const [sortBy, setSortBy] = useState('winRate');
  const [selected, setSelected] = useState<any>(null);
  const { fighters } = useDB();

  const enriched = fighters.map(f => ({
    raw: f,
    id:         Number(f.id),
    name:       String(f.name),
    archetype:  String(f.archetype),
    lore:       String((f as any).lore ?? ''),
    str:        Number(f.strength),
    spd:        Number(f.speed),
    int:        Number(f.intelligence),
    lck:        Number(f.luck),
    cha:        Number((f as any).charisma ?? 0),
    wins:       Number(f.wins),
    played:     Number(f.tournamentsPlayed),
    points:     Number((f as any).totalPointsEarned ?? 0),
    avatarUrl:  String((f as any).avatarUrl ?? ''),
    winRate:    f.tournamentsPlayed > 0 ? Math.round((Number(f.wins) / Number(f.tournamentsPlayed)) * 100) : 0,
  }));

  const filtered = enriched
    .filter(f => {
      const q = searchQuery.toLowerCase();
      return (
        f.name.toLowerCase().includes(q) &&
        (archetypeFilter === 'All' || f.archetype === archetypeFilter)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'winRate')    return b.winRate - a.winRate;
      if (sortBy === 'experience') return b.played - a.played;
      if (sortBy === 'points')     return b.points - a.points;
      return 0;
    });

  const archetypes = ['All', ...Array.from(new Set(enriched.map(f => f.archetype)))];

  return (
    <div className="min-h-screen bg-bg-primary">
      <NavBar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="font-display text-5xl md:text-7xl text-accent-gold mb-2 tracking-widest">THE FIGHTERS</h1>
          <p className="font-serif italic text-lg text-text-secondary">Study them. Understand them. Profit from them.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search fighters…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-bg-secondary border border-separator text-text-primary pl-10 pr-4 py-2.5 font-mono text-sm focus:border-accent-gold outline-none"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <select
              value={archetypeFilter}
              onChange={e => setArchetypeFilter(e.target.value)}
              className="bg-bg-secondary border border-separator text-text-primary pl-10 pr-8 py-2.5 font-mono text-sm appearance-none cursor-pointer focus:border-accent-gold outline-none"
            >
              {archetypes.map(a => <option key={a} value={a}>{a === 'All' ? 'All Archetypes' : a}</option>)}
            </select>
          </div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="bg-bg-secondary border border-separator text-text-primary px-4 py-2.5 font-mono text-sm appearance-none cursor-pointer focus:border-accent-gold outline-none"
          >
            <option value="winRate">Sort: Win Rate</option>
            <option value="experience">Sort: Experience</option>
            <option value="points">Sort: Total Points</option>
          </select>
          <span className="font-mono text-xs text-text-secondary self-center whitespace-nowrap">
            {filtered.length} / {enriched.length} fighters
          </span>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map(f => (
            <motion.div
              key={f.id}
              whileHover={{ y: -4, scale: 1.02 }}
              onClick={() => setSelected(f)}
              className="bg-bg-secondary border border-separator hover:border-accent-gold cursor-pointer transition-colors relative overflow-hidden group"
            >
              {/* Avatar */}
              <div className="w-full aspect-square bg-bg-tertiary relative overflow-hidden">
                {f.avatarUrl ? (
                  <img src={f.avatarUrl} alt={f.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">⚔️</div>
                )}
                {/* Archetype badge */}
                <div className={`absolute top-2 left-2 font-mono text-xs px-1.5 py-0.5 border ${ARCHETYPE_COLOR[f.archetype] ?? 'text-text-secondary border-separator'}`}>
                  {ARCHETYPE_ICON[f.archetype]} {f.archetype}
                </div>
                {/* Win rate chip */}
                <div className="absolute bottom-2 right-2 bg-bg-primary/80 backdrop-blur-sm border border-accent-gold/40 px-2 py-0.5 font-mono text-xs text-accent-gold">
                  {f.winRate}% WR
                </div>
              </div>

              {/* Info */}
              <div className="p-3">
                <h3 className="font-display text-sm text-accent-gold truncate mb-1">{f.name}</h3>
                <div className="flex justify-between font-mono text-xs text-text-secondary mb-3">
                  <span>{f.played} fights</span>
                  <span>{f.wins}W</span>
                </div>

                {/* Mini stat bars */}
                <div className="space-y-1">
                  {[['STR', f.str], ['SPD', f.spd], ['INT', f.int]] .map(([label, val]) => (
                    <div key={label as string} className="flex items-center gap-2">
                      <span className="font-mono text-xs text-text-secondary w-6">{label}</span>
                      <div className="flex-1 h-1 bg-bg-tertiary">
                        <div className="h-full bg-accent-gold/70 transition-all" style={{ width: `${(Number(val) / 10) * 100}%` }} />
                      </div>
                      <span className="font-mono text-xs text-text-secondary w-4 text-right">{val}</span>
                    </div>
                  ))}
                </div>

                {/* Hover CTA */}
                <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity font-mono text-xs text-center text-accent-gold border border-accent-gold/40 py-1">
                  View Profile →
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-text-secondary font-mono">No fighters match your filters.</div>
        )}
      </div>

      {/* Fighter Detail Panel */}
      <AnimatePresence>
        {selected && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              className="fixed inset-0 bg-bg-primary/70 backdrop-blur-sm z-40"
            />
            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-bg-secondary border-l border-separator z-50 overflow-y-auto"
            >
              {/* Close */}
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 p-2 text-text-secondary hover:text-text-primary transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Avatar */}
              <div className="w-full aspect-square bg-bg-tertiary relative">
                {selected.avatarUrl ? (
                  <img src={selected.avatarUrl} alt={selected.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-8xl opacity-10">⚔️</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-bg-secondary via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <div className={`inline-block font-mono text-xs px-2 py-1 border mb-2 ${ARCHETYPE_COLOR[selected.archetype] ?? ''}`}>
                    {ARCHETYPE_ICON[selected.archetype]} {selected.archetype}
                  </div>
                  <h2 className="font-display text-3xl text-accent-gold">{selected.name}</h2>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Lore */}
                {selected.lore && (
                  <div>
                    <h3 className="font-heading text-xs uppercase tracking-widest text-text-secondary mb-2">Origin</h3>
                    <p className="font-serif italic text-text-primary leading-relaxed text-sm">{selected.lore}</p>
                  </div>
                )}

                {/* Career stats */}
                <div>
                  <h3 className="font-heading text-xs uppercase tracking-widest text-text-secondary mb-3">Career</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { icon: <Trophy className="w-4 h-4" />, label: 'Wins',       value: selected.wins },
                      { icon: <Swords className="w-4 h-4" />,  label: 'Fights',     value: selected.played },
                      { icon: <Star className="w-4 h-4" />,    label: 'Win Rate',   value: `${selected.winRate}%` },
                    ].map(({ icon, label, value }) => (
                      <div key={label} className="bg-bg-tertiary p-3 text-center">
                        <div className="text-accent-gold flex justify-center mb-1">{icon}</div>
                        <div className="font-display text-xl text-text-primary">{value}</div>
                        <div className="font-mono text-xs text-text-secondary">{label}</div>
                      </div>
                    ))}
                  </div>
                  {selected.points > 0 && (
                    <div className="mt-3 flex items-center gap-2 bg-bg-tertiary px-3 py-2">
                      <Shield className="w-4 h-4 text-accent-gold" />
                      <span className="font-mono text-sm text-text-secondary">Lifetime points earned:</span>
                      <span className="font-display text-accent-gold ml-auto">{selected.points}</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div>
                  <h3 className="font-heading text-xs uppercase tracking-widest text-text-secondary mb-3">Combat Stats</h3>
                  <div className="space-y-2.5">
                    <StatBar label="STR" value={selected.str} />
                    <StatBar label="SPD" value={selected.spd} />
                    <StatBar label="INT" value={selected.int} />
                    <StatBar label="LCK" value={selected.lck} />
                    <StatBar label="CHA" value={selected.cha} />
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
