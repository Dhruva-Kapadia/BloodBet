import { Button } from '../components/Button';
import { motion } from 'motion/react';
import { Target, Users, Cog, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router';

export function LandingPage() {
  const navigate = useNavigate();

  const features = [
    { icon: Target, title: 'Precision Bets', desc: 'Round-by-round survival odds', link: '/tournament' },
    { icon: Users, title: 'Sign Contracts', desc: 'Own a fighter across 3 tournaments', link: '/contracts' },
    { icon: Cog, title: 'Build Your AI', desc: 'Design and deploy your own gladiator', link: '/build-fighter' },
    { icon: Trophy, title: 'Host Arenas', desc: 'Become the Game Master', link: '/host-tournament' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-6">
        {/* Animated background particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-accent-gold rounded-full opacity-20"
              animate={{
                x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
                y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: Math.random() * 20 + 10,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
              }}
            />
          ))}
        </div>

        {/* Live badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-8 right-8 flex items-center gap-2 bg-bg-secondary border border-separator px-4 py-2"
        >
          <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
          <span className="font-mono text-sm text-text-primary">
            LIVE NOW — Tournament #47 · Round 3 of 5
          </span>
        </motion.div>

        {/* Hero content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center relative z-10"
        >
          <h1 className="mb-6">ONLY ONE<br />SURVIVES.</h1>
          <p className="font-serif italic text-2xl text-text-primary max-w-2xl mx-auto mb-12">
            "50 AI gladiators. 20 enter the arena. One walks out. Where do you place your faith?"
          </p>

          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate('/login')}>Enter The Arena</Button>
            <Button variant="secondary" onClick={() => navigate('/tournament')}>Watch Live</Button>
          </div>
        </motion.div>
      </section>

      {/* Features Strip */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-bg-secondary border border-separator inner-glow p-8 text-center cursor-pointer hover:border-accent-gold transition-all"
                onClick={() => navigate(feature.link)}
              >
                <Icon className="w-12 h-12 text-accent-gold mx-auto mb-4" />
                <h3 className="font-heading text-xl text-accent-gold mb-2">{feature.title}</h3>
                <p className="font-mono text-sm text-text-secondary">{feature.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Live Tournament Preview */}
      <section className="py-20 px-6 bg-bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="font-display text-5xl text-accent-gold mb-2">
              ACTIVE TOURNAMENT
            </h2>
            <p className="font-heading text-2xl text-text-primary">
              TOURNAMENT #47: "THE CRIMSON SEASON"
            </p>
          </div>

          {/* Tournament info card */}
          <div className="bg-bg-tertiary border border-accent-gold inner-glow p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div>
                <div className="font-mono text-text-secondary text-xs uppercase mb-1">
                  Round Progress
                </div>
                <div className="font-heading text-2xl text-accent-gold">Round 3 of 5</div>
              </div>
              <div>
                <div className="font-mono text-text-secondary text-xs uppercase mb-1">
                  Survivors
                </div>
                <div className="font-heading text-2xl text-text-primary">8 / 20</div>
              </div>
              <div>
                <div className="font-mono text-text-secondary text-xs uppercase mb-1">
                  Total Bet Pool
                </div>
                <div className="font-heading text-2xl text-success-green">$284,490</div>
              </div>
              <div>
                <div className="font-mono text-text-secondary text-xs uppercase mb-1">
                  Top Bettor
                </div>
                <div className="font-mono text-sm text-text-primary">
                  @voidhunter_x · $12,000
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={() => navigate('/tournament')}>Watch Live</Button>
              <Button variant="secondary" onClick={() => navigate('/login')}>
                Place Bets
              </Button>
            </div>
          </div>

          {/* Mini character grid preview */}
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className={`aspect-square border ${
                  i < 8 ? 'border-accent-ice-blue bg-bg-tertiary' : 'border-separator bg-bg-primary opacity-30'
                } flex items-center justify-center relative`}
              >
                {i >= 8 && (
                  <div className="absolute inset-0 flex items-center justify-center text-2xl">
                    💀
                  </div>
                )}
                {i < 8 && (
                  <div className="text-accent-gold text-xs font-mono">F{i + 1}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-gradient-to-br from-bg-primary to-bg-tertiary">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-5xl text-accent-gold mb-16 text-center">
            HOW IT WORKS
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { num: '1', title: 'ANALYZE', desc: 'Study character profiles, stats, histories' },
              { num: '2', title: 'BET', desc: 'Place multi-type bets before and during rounds' },
              { num: '3', title: 'ASCEND', desc: 'Win capital, sign contracts, build fighters, host tournaments' },
            ].map((step) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-20 h-20 border-2 border-accent-gold flex items-center justify-center mx-auto mb-6">
                  <span className="font-display text-4xl text-accent-gold">{step.num}</span>
                </div>
                <h3 className="font-heading text-2xl text-accent-gold mb-3">{step.title}</h3>
                <p className="font-mono text-text-secondary">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-bg-primary border-t border-separator py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-display text-2xl text-accent-gold">BLOODBETS</div>
          <nav className="flex gap-8 font-mono text-sm">
            <a onClick={() => navigate('/fighters')} className="text-text-secondary hover:text-accent-gold transition-colors cursor-pointer">
              Fighters
            </a>
            <a onClick={() => navigate('/leaderboard')} className="text-text-secondary hover:text-accent-gold transition-colors cursor-pointer">
              Leaderboard
            </a>
            <a onClick={() => navigate('/login')} className="text-text-secondary hover:text-accent-gold transition-colors cursor-pointer">
              Sign In
            </a>
          </nav>
          <div className="font-serif italic text-text-secondary">
            "The Capitol watches. Do you?"
          </div>
        </div>
      </footer>
    </div>
  );
}
