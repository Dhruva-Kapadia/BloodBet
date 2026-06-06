import { useState } from 'react';
import { CharacterCard } from '../components/CharacterCard';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router';
import { Filter, Search } from 'lucide-react';
import { useDB } from '../context/SpacetimeContext';

const allFighters = [
  { name: 'IRON_CIPHER', archetype: 'STRATEGIST', role: 'Strategist', stats: { str: 4, spd: 3, int: 5, luck: 2 }, survivalOdds: 82, winOdds: '12.4x', winRate: 47, tournaments: 14, wins: 3, contractAvailable: true },
  { name: 'VEXOR_9', archetype: 'BRUTE · AGGRESSIVE', role: 'Brute', stats: { str: 5, spd: 4, int: 2, luck: 3 }, survivalOdds: 76, winOdds: '8.2x', winRate: 52, tournaments: 18, wins: 5, contractAvailable: false },
  { name: 'NULLBORN', archetype: 'SPY · BETRAYER', role: 'Spy', stats: { str: 2, spd: 5, int: 4, luck: 4 }, survivalOdds: 68, winOdds: '15.1x', winRate: 38, tournaments: 12, wins: 2, contractAvailable: true },
  { name: 'SHADOW_BLOOM', archetype: 'MEDIC · SUPPORTER', role: 'Medic', stats: { str: 3, spd: 3, int: 4, luck: 3 }, survivalOdds: 71, winOdds: '18.3x', winRate: 41, tournaments: 16, wins: 3, contractAvailable: true },
  { name: 'PRISM_WILD', archetype: 'WILDCARD', role: 'Wildcard', stats: { str: 3, spd: 5, int: 3, luck: 5 }, survivalOdds: 45, winOdds: '22.0x', winRate: 28, tournaments: 9, wins: 1, contractAvailable: false },
  { name: 'ECHO_FANG', archetype: 'LONE WOLF', role: 'Strategist', stats: { str: 4, spd: 4, int: 3, luck: 2 }, survivalOdds: 65, winOdds: '14.7x', winRate: 44, tournaments: 15, wins: 4, contractAvailable: true },
  { name: 'CRIMSON_SAGE', archetype: 'STRATEGIST · ALLIANCE', role: 'Strategist', stats: { str: 2, spd: 3, int: 5, luck: 3 }, survivalOdds: 79, winOdds: '11.2x', winRate: 49, tournaments: 20, wins: 6, contractAvailable: false },
  { name: 'BLADE_QUEEN', archetype: 'BRUTE · RUTHLESS', role: 'Brute', stats: { str: 5, spd: 3, int: 2, luck: 4 }, survivalOdds: 74, winOdds: '9.5x', winRate: 55, tournaments: 22, wins: 7, contractAvailable: true },
  { name: 'GHOST_KING', archetype: 'SPY · STEALTH', role: 'Spy', stats: { str: 3, spd: 5, int: 4, luck: 2 }, survivalOdds: 62, winOdds: '16.8x', winRate: 39, tournaments: 13, wins: 2, contractAvailable: true },
  { name: 'VOID_HUNTER', archetype: 'LONE WOLF', role: 'Strategist', stats: { str: 4, spd: 4, int: 3, luck: 3 }, survivalOdds: 70, winOdds: '13.9x', winRate: 45, tournaments: 17, wins: 4, contractAvailable: false },
  { name: 'STORM_BREAKER', archetype: 'BRUTE', role: 'Brute', stats: { str: 5, spd: 2, int: 3, luck: 4 }, survivalOdds: 69, winOdds: '14.3x', winRate: 48, tournaments: 19, wins: 5, contractAvailable: true },
  { name: 'SILK_VENOM', archetype: 'BETRAYER', role: 'Spy', stats: { str: 2, spd: 4, int: 5, luck: 2 }, survivalOdds: 58, winOdds: '19.4x', winRate: 35, tournaments: 11, wins: 2, contractAvailable: true },
  { name: 'IRON_LOTUS', archetype: 'MEDIC', role: 'Medic', stats: { str: 3, spd: 3, int: 4, luck: 4 }, survivalOdds: 72, winOdds: '17.1x', winRate: 42, tournaments: 14, wins: 3, contractAvailable: false },
  { name: 'FURY_BORN', archetype: 'WILDCARD · AGGRESSIVE', role: 'Wildcard', stats: { str: 5, spd: 5, int: 1, luck: 3 }, survivalOdds: 52, winOdds: '20.5x', winRate: 31, tournaments: 8, wins: 1, contractAvailable: true },
  { name: 'NIGHT_WHISPER', archetype: 'SPY', role: 'Spy', stats: { str: 2, spd: 5, int: 4, luck: 3 }, survivalOdds: 66, winOdds: '15.8x', winRate: 40, tournaments: 12, wins: 2, contractAvailable: true },
  { name: 'STEEL_HEART', archetype: 'STRATEGIST', role: 'Strategist', stats: { str: 4, spd: 2, int: 5, luck: 3 }, survivalOdds: 77, winOdds: '12.9x', winRate: 46, tournaments: 18, wins: 5, contractAvailable: false },
  { name: 'RAVEN_CLAW', archetype: 'LONE WOLF · HUNTER', role: 'Strategist', stats: { str: 4, spd: 4, int: 3, luck: 3 }, survivalOdds: 68, winOdds: '14.1x', winRate: 43, tournaments: 15, wins: 4, contractAvailable: true },
  { name: 'CRYSTAL_FANG', archetype: 'WILDCARD', role: 'Wildcard', stats: { str: 3, spd: 4, int: 3, luck: 5 }, survivalOdds: 48, winOdds: '21.3x', winRate: 29, tournaments: 10, wins: 1, contractAvailable: true },
  { name: 'SERPENT_EYE', archetype: 'BETRAYER · SPY', role: 'Spy', stats: { str: 2, spd: 4, int: 5, luck: 3 }, survivalOdds: 61, winOdds: '18.7x', winRate: 37, tournaments: 13, wins: 2, contractAvailable: false },
  { name: 'TITAN_FALL', archetype: 'BRUTE · TANK', role: 'Brute', stats: { str: 5, spd: 2, int: 2, luck: 5 }, survivalOdds: 64, winOdds: '16.2x', winRate: 41, tournaments: 14, wins: 3, contractAvailable: true },
  // Additional fighters to reach 50
  { name: 'AZURE_PHANTOM', archetype: 'SPY', role: 'Spy', stats: { str: 2, spd: 5, int: 4, luck: 3 }, survivalOdds: 63, winOdds: '17.2x', winRate: 38, tournaments: 11, wins: 2, contractAvailable: true },
  { name: 'CRIMSON_FURY', archetype: 'BRUTE', role: 'Brute', stats: { str: 5, spd: 3, int: 2, luck: 4 }, survivalOdds: 71, winOdds: '13.5x', winRate: 50, tournaments: 19, wins: 6, contractAvailable: false },
  { name: 'SILVER_SAGE', archetype: 'STRATEGIST', role: 'Strategist', stats: { str: 3, spd: 3, int: 5, luck: 2 }, survivalOdds: 75, winOdds: '12.1x', winRate: 47, tournaments: 17, wins: 5, contractAvailable: true },
  { name: 'DEATH_WHISPER', archetype: 'WILDCARD', role: 'Wildcard', stats: { str: 4, spd: 5, int: 2, luck: 5 }, survivalOdds: 49, winOdds: '21.8x', winRate: 30, tournaments: 9, wins: 1, contractAvailable: true },
  { name: 'EMERALD_CLAW', archetype: 'MEDIC', role: 'Medic', stats: { str: 3, spd: 3, int: 4, luck: 4 }, survivalOdds: 69, winOdds: '16.9x', winRate: 40, tournaments: 13, wins: 3, contractAvailable: false },
  { name: 'OBSIDIAN_HEART', archetype: 'BRUTE', role: 'Brute', stats: { str: 5, spd: 2, int: 3, luck: 4 }, survivalOdds: 67, winOdds: '14.8x', winRate: 46, tournaments: 16, wins: 4, contractAvailable: true },
  { name: 'FROST_VIPER', archetype: 'SPY · STEALTH', role: 'Spy', stats: { str: 2, spd: 5, int: 4, luck: 3 }, survivalOdds: 60, winOdds: '18.2x', winRate: 36, tournaments: 12, wins: 2, contractAvailable: true },
  { name: 'THUNDER_STRIKE', archetype: 'BRUTE · AGGRESSIVE', role: 'Brute', stats: { str: 5, spd: 4, int: 2, luck: 3 }, survivalOdds: 73, winOdds: '11.7x', winRate: 51, tournaments: 20, wins: 6, contractAvailable: false },
  { name: 'LUNAR_SHADOW', archetype: 'SPY', role: 'Spy', stats: { str: 3, spd: 5, int: 4, luck: 2 }, survivalOdds: 64, winOdds: '15.4x', winRate: 39, tournaments: 14, wins: 3, contractAvailable: true },
  { name: 'SOLAR_FURY', archetype: 'WILDCARD', role: 'Wildcard', stats: { str: 4, spd: 4, int: 3, luck: 5 }, survivalOdds: 51, winOdds: '20.2x', winRate: 32, tournaments: 10, wins: 2, contractAvailable: true },
  { name: 'JADE_EMPEROR', archetype: 'STRATEGIST', role: 'Strategist', stats: { str: 3, spd: 3, int: 5, luck: 3 }, survivalOdds: 78, winOdds: '11.8x', winRate: 48, tournaments: 19, wins: 5, contractAvailable: false },
  { name: 'RUBY_ASSASSIN', archetype: 'SPY · BETRAYER', role: 'Spy', stats: { str: 2, spd: 5, int: 5, luck: 2 }, survivalOdds: 59, winOdds: '19.1x', winRate: 35, tournaments: 11, wins: 2, contractAvailable: true },
  { name: 'ONYX_TITAN', archetype: 'BRUTE · TANK', role: 'Brute', stats: { str: 5, spd: 2, int: 2, luck: 5 }, survivalOdds: 66, winOdds: '15.9x', winRate: 43, tournaments: 15, wins: 4, contractAvailable: true },
  { name: 'AMBER_LOTUS', archetype: 'MEDIC · HEALER', role: 'Medic', stats: { str: 3, spd: 3, int: 4, luck: 4 }, survivalOdds: 70, winOdds: '17.5x', winRate: 41, tournaments: 13, wins: 3, contractAvailable: false },
  { name: 'VOID_REAPER', archetype: 'WILDCARD · CHAOS', role: 'Wildcard', stats: { str: 4, spd: 5, int: 2, luck: 5 }, survivalOdds: 47, winOdds: '22.4x', winRate: 27, tournaments: 8, wins: 1, contractAvailable: true },
  { name: 'PLATINUM_SHIELD', archetype: 'STRATEGIST · DEFENDER', role: 'Strategist', stats: { str: 4, spd: 2, int: 5, luck: 3 }, survivalOdds: 76, winOdds: '12.6x', winRate: 45, tournaments: 17, wins: 4, contractAvailable: true },
  { name: 'SCARLET_VENOM', archetype: 'SPY', role: 'Spy', stats: { str: 2, spd: 4, int: 5, luck: 3 }, survivalOdds: 62, winOdds: '16.5x', winRate: 38, tournaments: 12, wins: 2, contractAvailable: false },
  { name: 'BRONZE_GOLIATH', archetype: 'BRUTE', role: 'Brute', stats: { str: 5, spd: 3, int: 2, luck: 4 }, survivalOdds: 72, winOdds: '13.2x', winRate: 49, tournaments: 18, wins: 5, contractAvailable: true },
  { name: 'DIAMOND_EDGE', archetype: 'STRATEGIST', role: 'Strategist', stats: { str: 4, spd: 3, int: 5, luck: 2 }, survivalOdds: 80, winOdds: '10.9x', winRate: 52, tournaments: 21, wins: 7, contractAvailable: false },
  { name: 'SAPPHIRE_STORM', archetype: 'WILDCARD', role: 'Wildcard', stats: { str: 3, spd: 5, int: 3, luck: 5 }, survivalOdds: 50, winOdds: '21.1x', winRate: 31, tournaments: 9, wins: 1, contractAvailable: true },
  { name: 'COPPER_FANG', archetype: 'SPY · HUNTER', role: 'Spy', stats: { str: 3, spd: 5, int: 4, luck: 2 }, survivalOdds: 65, winOdds: '15.1x', winRate: 40, tournaments: 14, wins: 3, contractAvailable: true },
  { name: 'IVORY_CLAW', archetype: 'MEDIC', role: 'Medic', stats: { str: 3, spd: 3, int: 4, luck: 4 }, survivalOdds: 68, winOdds: '17.8x', winRate: 39, tournaments: 12, wins: 2, contractAvailable: false },
  { name: 'MERCURY_BLADE', archetype: 'BRUTE · SWIFT', role: 'Brute', stats: { str: 5, spd: 4, int: 2, luck: 3 }, survivalOdds: 74, winOdds: '12.3x', winRate: 53, tournaments: 20, wins: 6, contractAvailable: true },
  { name: 'TOPAZ_SENTINEL', archetype: 'STRATEGIST', role: 'Strategist', stats: { str: 3, spd: 3, int: 5, luck: 3 }, survivalOdds: 77, winOdds: '11.5x', winRate: 46, tournaments: 16, wins: 4, contractAvailable: true },
  { name: 'GARNET_SHADOW', archetype: 'SPY · ASSASSIN', role: 'Spy', stats: { str: 2, spd: 5, int: 4, luck: 3 }, survivalOdds: 61, winOdds: '18.5x', winRate: 37, tournaments: 13, wins: 2, contractAvailable: false },
  { name: 'PEARL_GUARDIAN', archetype: 'MEDIC · PROTECTOR', role: 'Medic', stats: { str: 3, spd: 3, int: 4, luck: 4 }, survivalOdds: 71, winOdds: '16.3x', winRate: 42, tournaments: 15, wins: 3, contractAvailable: true },
  { name: 'OBSIDIAN_WRAITH', archetype: 'WILDCARD · DARK', role: 'Wildcard', stats: { str: 4, spd: 5, int: 2, luck: 5 }, survivalOdds: 48, winOdds: '22.7x', winRate: 28, tournaments: 8, wins: 1, contractAvailable: true },
  { name: 'GOLDEN_PHOENIX', archetype: 'STRATEGIST · LEADER', role: 'Strategist', stats: { str: 4, spd: 3, int: 5, luck: 2 }, survivalOdds: 81, winOdds: '10.6x', winRate: 54, tournaments: 22, wins: 8, contractAvailable: false },
  { name: 'MIDNIGHT_HUNTER', archetype: 'SPY', role: 'Spy', stats: { str: 2, spd: 5, int: 4, luck: 3 }, survivalOdds: 63, winOdds: '17.0x', winRate: 38, tournaments: 11, wins: 2, contractAvailable: true },
  { name: 'DAWN_BREAKER', archetype: 'BRUTE · HEROIC', role: 'Brute', stats: { str: 5, spd: 3, int: 2, luck: 4 }, survivalOdds: 70, winOdds: '14.1x', winRate: 48, tournaments: 17, wins: 5, contractAvailable: true },
];

export function FightersPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('winRate');
  const { fighters, connected } = useDB();
console.log('Connected:', connected, '| Fighters:', fighters.length);

  const filteredFighters = allFighters
    .filter(fighter => {
      const matchesSearch = fighter.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'All' || fighter.role === roleFilter;
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      if (sortBy === 'winRate') return b.winRate - a.winRate;
      if (sortBy === 'tournaments') return b.tournaments - a.tournaments;
      if (sortBy === 'contract') return (b.contractAvailable ? 1 : 0) - (a.contractAvailable ? 1 : 0);
      return 0;
    });

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Navigation */}
      <nav className="bg-bg-primary border-b border-separator px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="font-display text-2xl text-accent-gold cursor-pointer" onClick={() => navigate('/')}>
            BLOODBETS
          </div>
          <div className="flex gap-4">
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              Dashboard
            </Button>
            <Button onClick={() => navigate('/contracts')}>
              Contract Auction
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-6xl md:text-8xl mb-4">THE 50 FIGHTERS</h1>
          <p className="font-serif italic text-2xl text-text-primary max-w-3xl mx-auto">
            "Study them. Understand them. Profit from them."
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-bg-secondary border border-separator inner-glow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                type="text"
                placeholder="Search fighters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-bg-tertiary border border-accent-gold text-text-primary pl-12 pr-4 py-3 font-mono"
              />
            </div>

            {/* Role Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full bg-bg-tertiary border border-accent-gold text-text-primary pl-12 pr-4 py-3 font-mono appearance-none cursor-pointer"
              >
                <option value="All">All Roles</option>
                <option value="Strategist">Strategist</option>
                <option value="Brute">Brute</option>
                <option value="Spy">Spy</option>
                <option value="Medic">Medic</option>
                <option value="Wildcard">Wildcard</option>
              </select>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-bg-tertiary border border-accent-gold text-text-primary px-4 py-3 font-mono appearance-none cursor-pointer"
            >
              <option value="winRate">Sort by Win Rate</option>
              <option value="tournaments">Sort by Experience</option>
              <option value="contract">Sort by Contract Availability</option>
            </select>
          </div>

          {/* Results count */}
          <div className="mt-4 font-mono text-sm text-text-secondary text-center">
            Showing {filteredFighters.length} of {allFighters.length} fighters
          </div>
        </div>

        {/* Fighter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {filteredFighters.map((fighter, idx) => (
            <div key={idx} className="relative">
              <CharacterCard {...fighter} onClick={() => navigate('/tournament')} />

              {/* Career stats badge */}
              <div className="absolute top-4 right-4 bg-bg-primary/90 backdrop-blur-sm border border-separator px-3 py-1">
                <div className="font-mono text-xs text-text-secondary">
                  {fighter.tournaments} tournaments · {fighter.wins} wins
                </div>
                <div className="font-heading text-accent-gold">{fighter.winRate}% win rate</div>
              </div>

              {/* Contract available badge */}
              {fighter.contractAvailable && (
                <div className="absolute bottom-4 left-4 right-4 bg-accent-gold text-bg-primary py-2 text-center font-heading text-xs uppercase tracking-wider">
                  Contract Available
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filteredFighters.length === 0 && (
          <div className="text-center py-20">
            <div className="font-display text-4xl text-text-secondary mb-4">NO FIGHTERS FOUND</div>
            <p className="font-mono text-text-secondary">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
