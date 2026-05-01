import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { GameState, FactionId } from '../models/game.models';
import * as GameActions from '../store/game.actions';
import { selectFactionReps } from '../store/game.selectors';
import { AchievementService } from './achievement.service';

@Injectable({ providedIn: 'root' })
export class FactionService {
  private reps: Record<FactionId, any> = {} as any;

  constructor(
    private store: Store<{ game: GameState }>,
    private achievement: AchievementService
  ) {
    this.store.select(selectFactionReps).subscribe(r => this.reps = r);
  }

  adjust(factionId: FactionId, delta: number): void {
    this.store.dispatch(GameActions.adjustReputation({ factionId, delta }));
    this.achievement.onFactionChanged();
  }

  getScore(factionId: FactionId): number {
    return this.reps[factionId]?.score ?? 0;
  }

  isFriendly(factionId: FactionId): boolean {
    return this.getScore(factionId) >= 20;
  }

  isHostile(factionId: FactionId): boolean {
    return this.getScore(factionId) <= -30;
  }

  /** Returns rep tier label */
  getTier(factionId: FactionId): string {
    const score = this.getScore(factionId);
    if (score >= 75)  return 'TRUSTED';
    if (score >= 40)  return 'ALLIED';
    if (score >= 10)  return 'KNOWN';
    if (score >= -10) return 'NEUTRAL';
    if (score >= -40) return 'SUSPECT';
    if (score >= -70) return 'HOSTILE';
    return 'ENEMY';
  }
}
