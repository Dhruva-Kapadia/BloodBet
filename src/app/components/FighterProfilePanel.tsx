import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, Swords, Star, Shield } from 'lucide-react';
import { StatBar } from './StatBar';

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

interface FighterProfilePanelProps {
  fighter: any | null;
  onClose: () => void;
}

export function FighterProfilePanel({ fighter, onClose }: FighterProfilePanelProps) {
  return (
    <AnimatePresence>
      {fighter && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-bg-primary/70 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-bg-secondary border-l border-separator z-50 overflow-y-auto"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-text-secondary hover:text-text-primary transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Avatar */}
            <div className="w-full aspect-square bg-bg-tertiary relative">
              {fighter.avatarUrl ? (
                <img src={fighter.avatarUrl} alt={fighter.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl opacity-10">⚔️</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-bg-secondary via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4">
                <div className={`inline-block font-mono text-xs px-2 py-1 border mb-2 ${ARCHETYPE_COLOR[fighter.archetype] ?? ''}`}>
                  {ARCHETYPE_ICON[fighter.archetype]} {fighter.archetype}
                </div>
                <h2 className="font-display text-3xl text-accent-gold">{fighter.name}</h2>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Lore */}
              {fighter.lore && (
                <div>
                  <h3 className="font-heading text-xs uppercase tracking-widest text-text-secondary mb-2">Origin</h3>
                  <p className="font-serif italic text-text-primary leading-relaxed text-sm">{fighter.lore}</p>
                </div>
              )}

              {/* Career stats */}
              <div>
                <h3 className="font-heading text-xs uppercase tracking-widest text-text-secondary mb-3">Career</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: <Trophy className="w-4 h-4" />, label: 'Wins',     value: fighter.wins },
                    { icon: <Swords className="w-4 h-4" />,  label: 'Fights',   value: fighter.played },
                    { icon: <Star className="w-4 h-4" />,    label: 'Win Rate', value: `${fighter.winRate}%` },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className="bg-bg-tertiary p-3 text-center">
                      <div className="text-accent-gold flex justify-center mb-1">{icon}</div>
                      <div className="font-display text-xl text-text-primary">{value}</div>
                      <div className="font-mono text-xs text-text-secondary">{label}</div>
                    </div>
                  ))}
                </div>
                {fighter.points > 0 && (
                  <div className="mt-3 flex items-center gap-2 bg-bg-tertiary px-3 py-2">
                    <Shield className="w-4 h-4 text-accent-gold" />
                    <span className="font-mono text-sm text-text-secondary">Lifetime points earned:</span>
                    <span className="font-display text-accent-gold ml-auto">{fighter.points}</span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div>
                <h3 className="font-heading text-xs uppercase tracking-widest text-text-secondary mb-3">Combat Stats</h3>
                <div className="space-y-2.5">
                  <StatBar label="STR" value={fighter.str} />
                  <StatBar label="SPD" value={fighter.spd} />
                  <StatBar label="INT" value={fighter.int} />
                  <StatBar label="LCK" value={fighter.lck} />
                  <StatBar label="CHA" value={fighter.cha} />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
