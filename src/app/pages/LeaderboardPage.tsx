import { useState } from 'react';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Trophy, Crown, TrendingUp, Award, Flame } from 'lucide-react';

const gameMasters = [
  { rank: 1, username: 'EMPEROR_VOID', tournaments: 47, prizePool: 8420000, topFighter: 'VOID_REAPER', status: 'LEGENDARY', avatar: '👑' },
  { rank: 2, username: 'BLADE_QUEEN', tournaments: 38, prizePool: 6250000, topFighter: 'CRIMSON_SAGE', status: 'LEGENDARY', avatar: '⚔️' },
  { rank: 3, username: 'GHOST_KING', tournaments: 34, prizePool: 5180000, topFighter: 'SHADOW_BLOOM', status: 'LEGENDARY', avatar: '👻' },
  { rank: 4, username: 'IRON_FIST', tournaments: 29, prizePool: 4320000, topFighter: 'IRON_CIPHER', status: 'ACTIVE', avatar: '✊' },
  { rank: 5, username: 'CRIMSON_SAGE', tournaments: 24, prizePool: 3890000, topFighter: 'FURY_BORN', status: 'ACTIVE', avatar: '🔥' },
  { rank: 6, username: 'VOID_HUNTER', tournaments: 22, prizePool: 3450000, topFighter: 'NIGHT_WHISPER', status: 'ACTIVE', avatar: '🎯' },
  { rank: 7, username: 'STORM_BREAKER', tournaments: 20, prizePool: 3120000, topFighter: 'STORM_BREAKER', status: 'ACTIVE', avatar: '⚡' },
  { rank: 8, username: 'SILK_VENOM', tournaments: 18, prizePool: 2890000, topFighter: 'SILK_VENOM', status: 'RISING', avatar: '🐍' },
  { rank: 9, username: 'IRON_LOTUS', tournaments: 16, prizePool: 2560000, topFighter: 'STEEL_HEART', status: 'RISING', avatar: '🌸' },
  { rank: 10, username: 'FURY_BORN', tournaments: 15, prizePool: 2340000, topFighter: 'TITAN_FALL', status: 'RISING', avatar: '💀' },
  { rank: 11, username: 'NIGHT_WHISPER', tournaments: 14, prizePool: 2120000, topFighter: 'LUNAR_SHADOW', status: 'RISING', avatar: '🌙' },
  { rank: 12, username: 'STEEL_HEART', tournaments: 13, prizePool: 1980000, topFighter: 'BRONZE_GOLIATH', status: 'ACTIVE', avatar: '🛡️' },
];

const topBettors = [
  { rank: 1, username: 'CAPITAL_KING', totalBets: 420000, wins: 284, winRate: 67.6, roi: 142, status: 'WHALE' },
  { rank: 2, username: 'LUCKY_VIPER', totalBets: 380000, wins: 245, winRate: 64.5, roi: 128, status: 'WHALE' },
  { rank: 3, username: 'BLOOD_MONEY', totalBets: 345000, wins: 198, winRate: 57.4, roi: 115, status: 'WHALE' },
  { rank: 4, username: 'GOLD_RUSH', totalBets: 298000, wins: 189, winRate: 63.4, roi: 108, status: 'HIGH_ROLLER' },
  { rank: 5, username: 'ARENA_SHARK', totalBets: 276000, wins: 172, winRate: 62.3, roi: 104, status: 'HIGH_ROLLER' },
  { rank: 6, username: 'PROFIT_HUNTER', totalBets: 248000, wins: 156, winRate: 62.9, roi: 98, status: 'HIGH_ROLLER' },
  { rank: 7, username: 'ODDS_MASTER', totalBets: 224000, wins: 142, winRate: 63.4, roi: 92, status: 'HIGH_ROLLER' },
  { rank: 8, username: 'RISK_TAKER', totalBets: 198000, wins: 124, winRate: 62.6, roi: 87, status: 'HIGH_ROLLER' },
  { rank: 9, username: 'BET_BARON', totalBets: 176000, wins: 108, winRate: 61.4, roi: 81, status: 'RISING' },
  { rank: 10, username: 'FORTUNE_SEEKER', totalBets: 156000, wins: 94, winRate: 60.3, roi: 76, status: 'RISING' },
];

const topFighters = [
  { rank: 1, name: 'GOLDEN_PHOENIX', tournaments: 22, wins: 12, winRate: 54.5, kills: 87, earnings: 1240000 },
  { rank: 2, name: 'DIAMOND_EDGE', tournaments: 21, wins: 11, winRate: 52.4, kills: 82, earnings: 1180000 },
  { rank: 3, name: 'BLADE_QUEEN', tournaments: 22, wins: 10, winRate: 45.5, kills: 94, earnings: 1050000 },
  { rank: 4, name: 'CRIMSON_FURY', tournaments: 19, wins: 9, winRate: 47.4, kills: 76, earnings: 980000 },
  { rank: 5, name: 'MERCURY_BLADE', tournaments: 20, wins: 9, winRate: 45.0, kills: 81, earnings: 920000 },
  { rank: 6, name: 'THUNDER_STRIKE', tournaments: 20, wins: 8, winRate: 40.0, kills: 88, earnings: 890000 },
  { rank: 7, name: 'IRON_CIPHER', tournaments: 14, wins: 7, winRate: 50.0, kills: 58, earnings: 840000 },
  { rank: 8, name: 'STEEL_HEART', tournaments: 18, wins: 7, winRate: 38.9, kills: 64, earnings: 780000 },
  { rank: 9, name: 'JADE_EMPEROR', tournaments: 19, wins: 6, winRate: 31.6, kills: 72, earnings: 720000 },
  { rank: 10, name: 'SILVER_SAGE', tournaments: 17, wins: 6, winRate: 35.3, kills: 61, earnings: 680000 },
];

export function LeaderboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'masters' | 'bettors' | 'fighters'>('masters');

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Navigation */}
      <nav className="bg-bg-primary border-b border-separator px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="font-display text-2xl text-accent-gold cursor-pointer" onClick={() => navigate('/')}>
            BLOODBETS
          </div>
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>
            Dashboard
          </Button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 1 }}
          >
            <h1 className="text-6xl md:text-8xl mb-4">HALL OF LEGENDS</h1>
          </motion.div>
          <p className="font-serif italic text-2xl text-text-primary">
            "Only the greatest are remembered"
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-8 mb-12 border-b border-separator">
          <button
            onClick={() => setActiveTab('masters')}
            className={`font-heading uppercase text-lg pb-4 transition-all ${
              activeTab === 'masters'
                ? 'text-accent-gold border-b-2 border-accent-gold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5" />
              Top Game Masters
            </div>
          </button>
          <button
            onClick={() => setActiveTab('bettors')}
            className={`font-heading uppercase text-lg pb-4 transition-all ${
              activeTab === 'bettors'
                ? 'text-accent-gold border-b-2 border-accent-gold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Top Bettors
            </div>
          </button>
          <button
            onClick={() => setActiveTab('fighters')}
            className={`font-heading uppercase text-lg pb-4 transition-all ${
              activeTab === 'fighters'
                ? 'text-accent-gold border-b-2 border-accent-gold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Top Fighters
            </div>
          </button>
        </div>

        {/* Top 3 Podium */}
        {activeTab === 'masters' && (
          <>
            <div className="grid grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto">
              {/* Rank 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="pt-12"
              >
                <div className="bg-bg-secondary border border-accent-gold inner-glow p-6 text-center">
                  <div className="text-6xl mb-4">{gameMasters[1].avatar}</div>
                  <div className="w-12 h-12 bg-gradient-to-br from-text-secondary to-text-primary flex items-center justify-center mx-auto mb-3">
                    <span className="font-display text-2xl text-bg-primary">2</span>
                  </div>
                  <h3 className="font-display text-2xl text-accent-gold mb-2">
                    {gameMasters[1].username}
                  </h3>
                  <div className="font-mono text-sm text-text-secondary mb-2">
                    {gameMasters[1].tournaments} tournaments
                  </div>
                  <div className="font-heading text-lg text-success-green">
                    ${(gameMasters[1].prizePool / 1000000).toFixed(1)}M
                  </div>
                </div>
              </motion.div>

              {/* Rank 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0 }}
              >
                <div className="bg-bg-secondary border-2 border-accent-gold inner-glow p-6 text-center relative glow-gold">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                    <Crown className="w-12 h-12 text-accent-gold" />
                  </div>
                  <div className="text-7xl mb-4 mt-4">{gameMasters[0].avatar}</div>
                  <div className="w-16 h-16 bg-gradient-to-br from-accent-gold to-accent-crimson-end flex items-center justify-center mx-auto mb-3">
                    <span className="font-display text-3xl text-bg-primary">1</span>
                  </div>
                  <h3 className="font-display text-3xl text-accent-gold mb-2">
                    {gameMasters[0].username}
                  </h3>
                  <div className="font-mono text-sm text-text-secondary mb-2">
                    {gameMasters[0].tournaments} tournaments
                  </div>
                  <div className="font-heading text-2xl text-success-green">
                    ${(gameMasters[0].prizePool / 1000000).toFixed(1)}M
                  </div>
                </div>
              </motion.div>

              {/* Rank 3 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="pt-16"
              >
                <div className="bg-bg-secondary border border-accent-gold inner-glow p-6 text-center">
                  <div className="text-6xl mb-4">{gameMasters[2].avatar}</div>
                  <div className="w-12 h-12 bg-gradient-to-br from-accent-crimson-start to-bg-tertiary flex items-center justify-center mx-auto mb-3">
                    <span className="font-display text-2xl text-text-primary">3</span>
                  </div>
                  <h3 className="font-display text-2xl text-accent-gold mb-2">
                    {gameMasters[2].username}
                  </h3>
                  <div className="font-mono text-sm text-text-secondary mb-2">
                    {gameMasters[2].tournaments} tournaments
                  </div>
                  <div className="font-heading text-lg text-success-green">
                    ${(gameMasters[2].prizePool / 1000000).toFixed(1)}M
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}

        {/* Full Leaderboard Table */}
        <div className="bg-bg-secondary border border-separator inner-glow">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 p-6 border-b border-separator font-heading uppercase text-xs text-accent-gold">
            <div className="col-span-1">Rank</div>
            <div className="col-span-3">
              {activeTab === 'masters' && 'Game Master'}
              {activeTab === 'bettors' && 'Bettor'}
              {activeTab === 'fighters' && 'Fighter'}
            </div>
            <div className="col-span-2">
              {activeTab === 'masters' && 'Tournaments'}
              {activeTab === 'bettors' && 'Total Bets'}
              {activeTab === 'fighters' && 'Tournaments'}
            </div>
            <div className="col-span-2">
              {activeTab === 'masters' && 'Prize Pool'}
              {activeTab === 'bettors' && 'Win Rate'}
              {activeTab === 'fighters' && 'Wins'}
            </div>
            <div className="col-span-2">
              {activeTab === 'masters' && 'Top Fighter'}
              {activeTab === 'bettors' && 'ROI'}
              {activeTab === 'fighters' && 'Kills'}
            </div>
            <div className="col-span-2">Status</div>
          </div>

          {/* Table Body - Game Masters */}
          {activeTab === 'masters' && (
            <div>
              {gameMasters.map((master, idx) => (
                <motion.div
                  key={master.rank}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="grid grid-cols-12 gap-4 p-6 border-b border-separator hover:bg-bg-tertiary transition-colors items-center"
                >
                  <div className="col-span-1">
                    <div
                      className={`w-10 h-10 border flex items-center justify-center font-display text-lg ${
                        master.rank <= 3
                          ? 'border-accent-gold text-accent-gold'
                          : 'border-separator text-text-secondary'
                      }`}
                    >
                      {master.rank}
                    </div>
                  </div>
                  <div className="col-span-3 flex items-center gap-3">
                    <span className="text-3xl">{master.avatar}</span>
                    <span className="font-heading text-lg text-text-primary">
                      {master.username}
                    </span>
                  </div>
                  <div className="col-span-2 font-mono text-text-primary">
                    {master.tournaments}
                  </div>
                  <div className="col-span-2 font-heading text-lg text-success-green">
                    ${(master.prizePool / 1000000).toFixed(2)}M
                  </div>
                  <div className="col-span-2 font-mono text-sm text-accent-gold">
                    {master.topFighter}
                  </div>
                  <div className="col-span-2">
                    <span
                      className={`px-3 py-1 text-xs font-heading uppercase ${
                        master.status === 'LEGENDARY'
                          ? 'bg-accent-gold/20 text-accent-gold border border-accent-gold'
                          : master.status === 'ACTIVE'
                          ? 'bg-accent-ice-blue/20 text-accent-ice-blue border border-accent-ice-blue'
                          : 'bg-success-green/20 text-success-green border border-success-green'
                      }`}
                    >
                      {master.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Table Body - Bettors */}
          {activeTab === 'bettors' && (
            <div>
              {topBettors.map((bettor, idx) => (
                <motion.div
                  key={bettor.rank}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="grid grid-cols-12 gap-4 p-6 border-b border-separator hover:bg-bg-tertiary transition-colors items-center"
                >
                  <div className="col-span-1">
                    <div
                      className={`w-10 h-10 border flex items-center justify-center font-display text-lg ${
                        bettor.rank <= 3
                          ? 'border-accent-gold text-accent-gold'
                          : 'border-separator text-text-secondary'
                      }`}
                    >
                      {bettor.rank}
                    </div>
                  </div>
                  <div className="col-span-3 font-heading text-lg text-text-primary">
                    {bettor.username}
                  </div>
                  <div className="col-span-2 font-heading text-lg text-success-green">
                    ${bettor.totalBets.toLocaleString()}
                  </div>
                  <div className="col-span-2 font-mono text-text-primary">
                    {bettor.winRate}%
                  </div>
                  <div className="col-span-2 font-heading text-lg text-accent-gold">
                    +{bettor.roi}%
                  </div>
                  <div className="col-span-2">
                    <span
                      className={`px-3 py-1 text-xs font-heading uppercase ${
                        bettor.status === 'WHALE'
                          ? 'bg-accent-gold/20 text-accent-gold border border-accent-gold'
                          : bettor.status === 'HIGH_ROLLER'
                          ? 'bg-accent-ice-blue/20 text-accent-ice-blue border border-accent-ice-blue'
                          : 'bg-success-green/20 text-success-green border border-success-green'
                      }`}
                    >
                      {bettor.status.replace('_', ' ')}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Table Body - Fighters */}
          {activeTab === 'fighters' && (
            <div>
              {topFighters.map((fighter, idx) => (
                <motion.div
                  key={fighter.rank}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="grid grid-cols-12 gap-4 p-6 border-b border-separator hover:bg-bg-tertiary transition-colors items-center"
                >
                  <div className="col-span-1">
                    <div
                      className={`w-10 h-10 border flex items-center justify-center font-display text-lg ${
                        fighter.rank <= 3
                          ? 'border-accent-gold text-accent-gold'
                          : 'border-separator text-text-secondary'
                      }`}
                    >
                      {fighter.rank}
                    </div>
                  </div>
                  <div className="col-span-3 font-display text-lg text-accent-gold">
                    {fighter.name}
                  </div>
                  <div className="col-span-2 font-mono text-text-primary">
                    {fighter.tournaments}
                  </div>
                  <div className="col-span-2 font-heading text-lg text-success-green">
                    {fighter.wins}
                  </div>
                  <div className="col-span-2 font-mono text-text-primary">
                    {fighter.kills}
                  </div>
                  <div className="col-span-2 font-heading text-accent-gold">
                    ${(fighter.earnings / 1000).toFixed(0)}K
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
