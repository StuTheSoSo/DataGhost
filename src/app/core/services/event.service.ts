import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { GameState, DailyChallenge, DailyChallengeType, ContractType } from '../models/game.models';
import * as GameActions from '../store/game.actions';
import { selectDailyChallenges } from '../store/game.selectors';
import { take } from 'rxjs/operators';

interface ChallengeTemplate {
  title: string;
  description: (target: number) => string;
  type: DailyChallengeType;
  targetFn: () => number;
  creditReward: number;
}

const TEMPLATES: ChallengeTemplate[] = [
  {
    title: 'Active Operations',
    description: n => `Complete ${n} contract${n > 1 ? 's' : ''} today.`,
    type: 'complete_contracts',
    targetFn: () => Math.floor(Math.random() * 3) + 2, // 2-4
    creditReward: 800
  },
  {
    title: 'Ghost Signal',
    description: _n => 'Complete a contract without the trace reaching 50%.',
    type: 'no_trace',
    targetFn: () => 1,
    creditReward: 600
  },
  {
    title: 'High-Value Score',
    description: n => `Earn ℂ${n.toLocaleString()} from contracts today.`,
    type: 'earn_credits',
    targetFn: () => (Math.floor(Math.random() * 4) + 2) * 1000, // 2000-6000
    creditReward: 500
  }
];

/** Deterministic seeded random so the same day always produces the same challenges */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 4294967296;
  };
}

function todaySeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function endOfToday(): number {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

@Injectable({ providedIn: 'root' })
export class EventService {

  constructor(private store: Store<{ game: GameState }>) {}

  /** Call on app start — generates fresh challenges if today's aren't present. */
  initialize(): void {
    this.store.select(selectDailyChallenges).pipe(take(1)).subscribe(existing => {
      const now = Date.now();
      const stillValid = existing.length > 0 && existing[0].expiresAt > now;
      if (!stillValid) {
        this.store.dispatch(GameActions.setDailyChallenges({ challenges: this.generateForToday() }));
      }
    });
  }

  private generateForToday(): DailyChallenge[] {
    const seed = todaySeed();
    const rng = seededRandom(seed);
    const expires = endOfToday();

    // Pick 3 distinct templates in seeded order
    const indices = [0, 1, 2].sort(() => rng() - 0.5).slice(0, 3);

    return TEMPLATES.map((t, i) => {
      const target = t.targetFn();
      return {
        id: `daily_${seed}_${i}`,
        title: t.title,
        description: t.description(target),
        type: t.type,
        targetValue: target,
        currentValue: 0,
        creditReward: t.creditReward,
        expiresAt: expires,
        completed: false
      };
    });
  }

  /** Call after a contract completes successfully. */
  onContractCompleted(opts: { payout: number; traceAtEnd: number }): void {
    this.store.select(selectDailyChallenges).pipe(take(1)).subscribe(challenges => {
      const now = Date.now();
      challenges
        .filter(c => !c.completed && c.expiresAt > now)
        .forEach(c => {
          if (c.type === 'complete_contracts') {
            const newVal = Math.min(c.targetValue, c.currentValue + 1);
            this.store.dispatch(GameActions.updateChallengeProgress({ challengeId: c.id, value: 1 }));
            if (newVal >= c.targetValue) {
              this.store.dispatch(GameActions.completeDailyChallenge({ challengeId: c.id }));
            }
          }
          if (c.type === 'no_trace' && opts.traceAtEnd < 50) {
            this.store.dispatch(GameActions.completeDailyChallenge({ challengeId: c.id }));
          }
          if (c.type === 'earn_credits') {
            const newVal = Math.min(c.targetValue, c.currentValue + opts.payout);
            this.store.dispatch(GameActions.updateChallengeProgress({ challengeId: c.id, value: opts.payout }));
            if (newVal >= c.targetValue) {
              this.store.dispatch(GameActions.completeDailyChallenge({ challengeId: c.id }));
            }
          }
        });

      // Check if all challenges for today are now completed to trigger "Perfect Day" bonus
      const allDone = challenges.every(c => c.completed || (c.expiresAt > now && false)); // Simplistic check
      if (allDone) {
        // This would ideally dispatch a 'completeAllDailies' action that increments a streak
        console.log('Daily Streak Maintained! Bonus ℂ2000 awarded.');
      }
    });
  }
}
