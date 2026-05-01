import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { GameState, LeaderboardEntry } from '../models/game.models';
import * as GameActions from '../store/game.actions';
import { selectLeaderboard, selectPlayer, selectStats } from '../store/game.selectors';
import { take } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LeaderboardService {

  constructor(private store: Store<{ game: GameState }>) {}

  /** Submit current player's score. Call after each contract complete. */
  submitCurrentScore(): void {
    combineLatest([
      this.store.select(selectPlayer),
      this.store.select(selectStats)
    ]).pipe(take(1)).subscribe(([player, stats]) => {
      if (!player) return;
      const entry: LeaderboardEntry = {
        alias: player.alias,
        archetype: player.archetype,
        totalCreditsEarned: stats.totalCreditsEarned,
        contractsCompleted: stats.contractsCompleted,
        timestamp: Date.now()
      };
      this.store.dispatch(GameActions.addLeaderboardEntry({ entry }));
    });
  }

  /** Returns leaderboard sorted by totalCreditsEarned desc (already sorted in reducer). */
  getLeaderboard$() {
    return this.store.select(selectLeaderboard);
  }
}
