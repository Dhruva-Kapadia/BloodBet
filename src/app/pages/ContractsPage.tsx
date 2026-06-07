import { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { NavBar } from '../components/NavBar';
import { FighterProfilePanel } from '../components/FighterProfilePanel';
import { TrendingUp, Award, Clock, Gavel, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useDB } from '../context/SpacetimeContext';

function useCountdown(endsAtMicros: number) {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    const tick = () => {
      const nowMs = Date.now();
      const endsMs = endsAtMicros / 1000;
      setRemaining(Math.max(0, endsMs - nowMs));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAtMicros]);
  return remaining;
}

function Countdown({ endsAtMicros }: { endsAtMicros: number }) {
  const ms = useCountdown(endsAtMicros);
  if (ms <= 0) return <span className="text-red-400 font-mono text-xs">ENDED</span>;
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  return (
    <span className="font-mono text-xs text-accent-gold">
      {h}h {String(m).padStart(2, '0')}m {String(s).padStart(2, '0')}s
    </span>
  );
}

export function ContractsPage() {
  const {
    fighters, contracts, auctionBids, auctions, currentUser, identity,
    placeBid, cancelBid, openAuction, settleAuction,
  } = useDB();

  const [selectedFighter, setSelectedFighter] = useState<number | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [profileFighter, setProfileFighter] = useState<any>(null);
  const [adminDuration, setAdminDuration] = useState('48');
  const [error, setError] = useState<string | null>(null);
  const isAdmin = currentUser?.isAdmin ?? false;

  const fighterById = (id: number) => fighters.find(f => Number(f.id) === id);

  const enrichFighter = (f: any) => ({
    id:        Number(f.id),
    name:      String(f.name),
    archetype: String(f.archetype),
    lore:      String((f as any).lore ?? ''),
    str:       Number(f.strength),
    spd:       Number(f.speed),
    int:       Number(f.intelligence),
    lck:       Number(f.luck),
    cha:       Number((f as any).charisma ?? 0),
    wins:      Number(f.wins),
    played:    Number(f.tournamentsPlayed),
    points:    Number((f as any).totalPointsEarned ?? 0),
    avatarUrl: String((f as any).avatarUrl ?? ''),
    winRate:   f.tournamentsPlayed > 0 ? Math.round((Number(f.wins) / Number(f.tournamentsPlayed)) * 100) : 0,
  });

  const myContracts = contracts
    .filter(c => c.userId?.toHexString?.() === identity)
    .map(c => {
      const fighter = fighterById(Number(c.fighterId));
      return {
        id: Number(c.id),
        fighterName: fighter?.name ?? `Fighter #${c.fighterId}`,
        fighterRaw: fighter ?? null,
        tournamentsRemaining: Number(c.tournamentsRemaining ?? 0),
        totalTournaments: 3,
        earned: Number(c.totalEarned ?? 0),
      };
    });

  const contractedFighterIds = new Set(contracts.map(c => Number(c.fighterId)));

  // Active (unsettled) auctions enriched with bid data
  const activeAuctions = auctions
    .filter(a => !a.settled)
    .map(a => {
      const fighterId = Number(a.fighterId);
      const fighter = fighterById(fighterId);
      const bidsForFighter = auctionBids.filter(b => Number(b.fighterId) === fighterId);
      const highestBid = bidsForFighter.reduce((max, b) => Math.max(max, Number(b.amount ?? 0)), 0);
      const myBid = bidsForFighter.find(b => b.bidderId?.toHexString?.() === identity);
      const myBidAmount = myBid ? Number(myBid.amount) : 0;
      const bidderCount = new Set(bidsForFighter.map(b => b.bidderId?.toHexString?.())).size;
      const endsAtMicros = Number(a.endsAtMicros ?? 0);
      const nowMicros = Date.now() * 1000;
      const ended = nowMicros > endsAtMicros;
      const amHighest = myBidAmount > 0 && myBidAmount >= highestBid;

      return {
        auctionId: Number(a.id),
        fighterId,
        fighter,
        fighterName: fighter?.name ?? `Fighter #${fighterId}`,
        avatarUrl: String(fighter?.avatarUrl ?? ''),
        highestBid,
        myBidAmount,
        bidderCount,
        endsAtMicros,
        ended,
        amHighest,
        canSettle: ended,
        wins: Number(fighter?.wins ?? 0),
        played: Number(fighter?.tournamentsPlayed ?? 0),
        survivalRate: fighter?.tournamentsPlayed > 0
          ? Math.round((Number(fighter.wins) / Number(fighter.tournamentsPlayed)) * 100)
          : 0,
      };
    });

  // Fighters with no active auction and not contracted — admin can open auctions
  const unlistedFighters = fighters
    .filter(f => {
      const id = Number(f.id);
      const hasAuction = auctions.some(a => !a.settled && Number(a.fighterId) === id);
      return !contractedFighterIds.has(id) && !hasAuction;
    });

  const handlePlaceBid = (fighterId: number) => {
    setSelectedFighter(fighterId);
    setError(null);
  };

  const confirmBid = (fighterId: number, currentHighest: number) => {
    const amount = Number(bidAmount);
    if (!amount || amount <= 0) { setError('Enter a valid amount'); return; }
    if (amount <= currentHighest) { setError(`Bid must exceed $${currentHighest.toFixed(2)}`); return; }
    if (amount > Number(currentUser?.balance ?? 0)) { setError('Insufficient balance'); return; }
    placeBid(fighterId, amount);
    setBidAmount('');
    setSelectedFighter(null);
    setError(null);
  };

  const handleSettle = (fighterId: number) => {
    settleAuction(fighterId);
  };

  const handleOpenAuction = (fighterId: number) => {
    const hours = Number(adminDuration);
    if (!hours || hours < 1) return;
    openAuction(fighterId, hours);
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <NavBar />

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-6xl md:text-8xl mb-4">CONTRACT AUCTION</h1>
          <p className="font-serif italic text-2xl text-text-primary max-w-3xl mx-auto">
            "Own a fighter. Share their glory."
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-bg-secondary border border-accent-gold inner-glow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="font-display text-3xl text-accent-gold mb-2">3</div>
              <div className="font-mono text-xs text-text-secondary uppercase">Tournament Contract Length</div>
            </div>
            <div>
              <div className="font-display text-3xl text-accent-gold mb-2">25%</div>
              <div className="font-mono text-xs text-text-secondary uppercase">Prize Pool on Win + $50/Fight</div>
            </div>
            <div>
              <div className="font-display text-3xl text-accent-gold mb-2">${Number(currentUser?.balance ?? 0).toFixed(0)}</div>
              <div className="font-mono text-xs text-text-secondary uppercase">Your Balance</div>
            </div>
          </div>
        </div>

        {/* My Contracts */}
        {myContracts.length > 0 && (
          <div className="mb-12">
            <h2 className="font-display text-4xl text-accent-gold mb-6 uppercase">My Contracts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myContracts.map((contract, idx) => (
                <motion.div
                  key={contract.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-bg-secondary border border-accent-gold inner-glow p-6"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3
                        className="font-display text-2xl text-accent-gold mb-2 cursor-pointer hover:underline"
                        onClick={() => contract.fighterRaw && setProfileFighter(enrichFighter(contract.fighterRaw))}
                      >
                        {contract.fighterName}
                      </h3>
                      <div className="font-mono text-sm text-text-secondary">
                        {contract.tournamentsRemaining} of {contract.totalTournaments} tournaments remaining
                      </div>
                    </div>
                    <div
                      className="w-16 h-16 bg-bg-tertiary border border-accent-gold overflow-hidden cursor-pointer"
                      onClick={() => contract.fighterRaw && setProfileFighter(enrichFighter(contract.fighterRaw))}
                    >
                      {(contract.fighterRaw as any)?.avatarUrl ? (
                        <img src={String((contract.fighterRaw as any).avatarUrl)} alt={contract.fighterName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">⚔️</div>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between font-mono text-xs text-text-secondary mb-2">
                      <span>Contract Progress</span>
                      <span>{contract.totalTournaments - contract.tournamentsRemaining}/{contract.totalTournaments}</span>
                    </div>
                    <div className="h-2 bg-bg-tertiary">
                      <div
                        className="h-full bg-gradient-to-r from-accent-gold to-success-green transition-all duration-500"
                        style={{ width: `${((contract.totalTournaments - contract.tournamentsRemaining) / contract.totalTournaments) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-bg-tertiary border border-separator p-3 text-center">
                    <div className="font-mono text-xs text-text-secondary uppercase mb-1">Total Earned</div>
                    <div className="font-heading text-xl text-success-green">${contract.earned.toLocaleString()}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Active Auctions */}
        <div className="mb-12">
          <h2 className="font-display text-4xl text-accent-gold mb-6 uppercase">Active Auctions</h2>
          {activeAuctions.length === 0 ? (
            <div className="font-mono text-sm text-text-secondary text-center py-12 border border-separator">
              No auctions running. {isAdmin ? 'Open one below.' : 'Check back later.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeAuctions.map((listing, idx) => (
                <motion.div
                  key={listing.auctionId}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-bg-secondary border border-separator inner-glow hover:border-accent-gold transition-all group flex flex-col"
                >
                  {/* Avatar */}
                  <div
                    className="w-full aspect-square bg-bg-tertiary overflow-hidden cursor-pointer relative"
                    onClick={() => listing.fighter && setProfileFighter(enrichFighter(listing.fighter))}
                  >
                    {listing.avatarUrl ? (
                      <img src={listing.avatarUrl} alt={listing.fighterName} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl text-accent-gold opacity-20 group-hover:opacity-40 transition-opacity">⚔️</div>
                    )}
                    {/* Countdown overlay */}
                    <div className={`absolute top-2 right-2 px-2 py-1 text-xs font-mono backdrop-blur-sm border ${listing.ended ? 'bg-red-900/80 border-red-500/60 text-red-300' : 'bg-bg-primary/80 border-accent-gold/40'}`}>
                      <Clock className="inline w-3 h-3 mr-1" />
                      {listing.ended ? 'ENDED' : <Countdown endsAtMicros={listing.endsAtMicros} />}
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h3
                      className="font-display text-xl text-accent-gold mb-3 cursor-pointer hover:underline"
                      onClick={() => listing.fighter && setProfileFighter(enrichFighter(listing.fighter))}
                    >
                      {listing.fighterName}
                    </h3>

                    {/* Career stats */}
                    <div className="grid grid-cols-3 gap-2 mb-4 font-mono text-xs">
                      <div>
                        <div className="text-text-secondary">Fights</div>
                        <div className="text-text-primary font-heading text-lg">{listing.played}</div>
                      </div>
                      <div>
                        <div className="text-text-secondary">Wins</div>
                        <div className="text-success-green font-heading text-lg">{listing.wins}</div>
                      </div>
                      <div>
                        <div className="text-text-secondary">Win %</div>
                        <div className="text-accent-ice-blue font-heading text-lg">{listing.survivalRate}%</div>
                      </div>
                    </div>

                    {/* Current bid */}
                    <div className="bg-bg-tertiary border border-accent-gold/40 p-4 mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-mono text-xs text-text-secondary uppercase">Highest Bid</span>
                        <span className="font-mono text-xs text-text-secondary">{listing.bidderCount} bidder{listing.bidderCount !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="font-display text-3xl text-accent-gold">
                        {listing.highestBid > 0 ? `$${listing.highestBid.toLocaleString()}` : 'No bids yet'}
                      </div>
                      {listing.myBidAmount > 0 && (
                        <div className={`mt-1 font-mono text-xs ${listing.amHighest ? 'text-success-green' : 'text-yellow-400'}`}>
                          Your bid: ${listing.myBidAmount.toLocaleString()} — {listing.amHighest ? '🏆 Winning' : '⚠️ Outbid'}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-auto space-y-2">
                      {listing.ended ? (
                        // Auction ended — highest bidder or anyone can settle
                        <Button
                          className="w-full !py-2 !text-sm"
                          onClick={() => handleSettle(listing.fighterId)}
                          disabled={listing.bidderCount === 0}
                        >
                          <Gavel className="inline w-4 h-4 mr-2" />
                          {listing.amHighest ? 'Claim Contract' : 'Settle Auction'}
                        </Button>
                      ) : selectedFighter === listing.fighterId ? (
                        <div className="space-y-2">
                          {error && <p className="font-mono text-xs text-red-400">{error}</p>}
                          <div className="font-mono text-xs text-text-secondary">
                            Balance: ${Number(currentUser?.balance ?? 0).toFixed(2)}
                          </div>
                          <input
                            type="number"
                            placeholder={`Min. $${(listing.highestBid + 1).toFixed(0)}`}
                            value={bidAmount}
                            onChange={e => setBidAmount(e.target.value)}
                            className="w-full bg-bg-tertiary border border-accent-gold text-text-primary px-4 py-2 font-mono text-sm"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <Button className="flex-1 !py-2 !text-sm" onClick={() => confirmBid(listing.fighterId, listing.highestBid)}>
                              Confirm Bid
                            </Button>
                            <button
                              onClick={() => { setSelectedFighter(null); setBidAmount(''); setError(null); }}
                              className="px-3 border border-separator text-text-secondary hover:text-text-primary transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button variant="secondary" className="flex-1 !py-2 !text-sm" onClick={() => handlePlaceBid(listing.fighterId)}>
                            {listing.myBidAmount > 0 ? 'Raise Bid' : 'Place Bid'}
                          </Button>
                          {listing.myBidAmount > 0 && (
                            <button
                              onClick={() => cancelBid(listing.fighterId)}
                              className="px-3 border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors font-mono text-xs"
                              title="Cancel your bid"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Admin: Open New Auction */}
        {isAdmin && unlistedFighters.length > 0 && (
          <div className="mb-12">
            <h2 className="font-display text-4xl text-accent-gold mb-6 uppercase">Open Auctions</h2>
            <div className="bg-bg-secondary border border-separator p-4 mb-4 flex items-center gap-3">
              <span className="font-mono text-xs text-text-secondary">Duration (hours):</span>
              <input
                type="number"
                value={adminDuration}
                onChange={e => setAdminDuration(e.target.value)}
                className="bg-bg-tertiary border border-separator text-text-primary px-3 py-1 font-mono text-sm w-20"
                min="1" max="168"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {unlistedFighters.map(f => (
                <motion.div
                  key={Number(f.id)}
                  whileHover={{ y: -2 }}
                  className="bg-bg-secondary border border-separator hover:border-accent-gold transition-colors cursor-pointer group"
                  onClick={() => handleOpenAuction(Number(f.id))}
                >
                  <div className="w-full aspect-square bg-bg-tertiary overflow-hidden">
                    {f.avatarUrl ? (
                      <img src={String(f.avatarUrl)} alt={String(f.name)} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl opacity-20 group-hover:opacity-40 transition-opacity">⚔️</div>
                    )}
                  </div>
                  <div className="p-2 text-center">
                    <p className="font-display text-xs text-accent-gold truncate">{String(f.name)}</p>
                    <p className="font-mono text-xs text-success-green mt-1">+ Open Auction</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* How It Works */}
        <div className="mt-8 bg-gradient-to-br from-bg-secondary to-bg-tertiary border border-separator p-8">
          <h3 className="font-display text-3xl text-accent-gold mb-6 text-center uppercase">How Contracts Work</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Award className="w-8 h-8 text-accent-gold" />, title: 'Win the Auction', body: 'Place the highest bid before time expires. No funds are locked — you pay when you claim.' },
              { icon: <TrendingUp className="w-8 h-8 text-accent-gold" />, title: 'Fighter Competes', body: 'Your fighter participates in 3 tournaments. Earn $50 per fight, plus 25% of prize pool on wins.' },
              { icon: <span className="font-display text-2xl text-accent-gold">$</span>, title: 'Earn Revenue', body: 'Winnings are deposited to your balance automatically after each tournament.' },
            ].map(({ icon, title, body }) => (
              <div key={title} className="text-center">
                <div className="w-16 h-16 border-2 border-accent-gold flex items-center justify-center mx-auto mb-4">{icon}</div>
                <h4 className="font-heading text-lg text-accent-gold mb-2 uppercase">{title}</h4>
                <p className="font-mono text-sm text-text-secondary">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <FighterProfilePanel fighter={profileFighter} onClose={() => setProfileFighter(null)} />
    </div>
  );
}
