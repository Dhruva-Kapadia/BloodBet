import { StatBar } from './StatBar';
import { motion } from 'motion/react';

interface CharacterCardProps {
  name: string;
  archetype: string;
  stats: {
    str: number;
    spd: number;
    int: number;
    luck: number;
  };
  survivalOdds: number;
  winOdds: string;
  avatar?: string;
  onClick?: () => void;
}

export function CharacterCard({
  name,
  archetype,
  stats,
  survivalOdds,
  winOdds,
  avatar,
  onClick
}: CharacterCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      onClick={onClick}
      className="bg-bg-secondary border border-separator inner-glow p-6 cursor-pointer group transition-all hover:border-accent-gold"
    >
      {/* Avatar placeholder */}
      <div className="w-full aspect-square bg-bg-tertiary mb-4 flex items-center justify-center">
        {avatar ? (
          <img src={avatar} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="text-6xl text-accent-gold opacity-20">⚔️</div>
        )}
      </div>

      {/* Name */}
      <h3 className="font-display text-xl text-accent-gold mb-2">{name}</h3>

      {/* Archetype */}
      <div className="font-heading text-text-secondary text-xs uppercase tracking-wider mb-4">
        {archetype}
      </div>

      {/* Stats */}
      <div className="space-y-2 mb-4">
        <StatBar label="STR" value={stats.str} />
        <StatBar label="SPD" value={stats.spd} />
        <StatBar label="INT" value={stats.int} />
        <StatBar label="LUCK" value={stats.luck} />
      </div>

      {/* Odds */}
      <div className="border-t border-separator pt-4 space-y-2">
        <div className="flex justify-between font-mono text-sm">
          <span className="text-text-secondary">Survive R1:</span>
          <span className="text-accent-ice-blue">{survivalOdds}%</span>
        </div>
        <div className="flex justify-between font-mono text-sm">
          <span className="text-text-secondary">Win Odds:</span>
          <span className="text-accent-gold">{winOdds}</span>
        </div>
      </div>

      {/* Hover button */}
      <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="w-full bg-accent-gold text-bg-primary py-2 font-heading uppercase text-sm tracking-wider">
          Bet on this fighter
        </button>
      </div>
    </motion.div>
  );
}
