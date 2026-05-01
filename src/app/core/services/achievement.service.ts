import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { GameState, Achievement, AchievementCategory, GameEndingType, StoryAct } from '../models/game.models';
import * as GameActions from '../store/game.actions';
import {
  selectAchievements, selectStats, selectRig, selectOwnedSoftware,
  selectFactionReps, selectEnding, selectCurrentAct
} from '../store/game.selectors';
import { take } from 'rxjs/operators';

export interface AchievementTrigger {
  /** Called from the hack page after a contract is completed successfully. */
  contractCompleted: (opts: { traceAtEnd: number; connSeconds: number; puzzleFirstAttempt: boolean }) => void;
  /** Called when act advances. */
  actAdvanced: (act: StoryAct) => void;
  /** Called when an ending is set. */
  endingSet: (ending: GameEndingType) => void;
  /** Called after rig upgrades or software acquisition. */
  rigChanged: () => void;
  /** Called after faction reputation changes. */
  factionChanged: () => void;
  /** Called when total credits earned crosses a milestone. */
  creditsEarned: (total: number) => void;
}

@Injectable({ providedIn: 'root' })
export class AchievementService {

  private achievements: Achievement[] = [];

  constructor(private store: Store<{ game: GameState }>) {
    this.store.select(selectAchievements).subscribe(a => this.achievements = a);
  }

  private isUnlocked(id: string): boolean {
    return this.achievements.some(a => a.id === id && a.unlockedAt !== null);
  }

  private unlock(id: string): void {
    if (!this.isUnlocked(id)) {
      this.store.dispatch(GameActions.unlockAchievement({ achievementId: id }));
    }
  }

  // ── Contract completion ──────────────────────────────────

  onContractCompleted(opts: { traceAtEnd: number; connSeconds: number; puzzleFirstAttempt: boolean; contractsCompleted: number }): void {
    // First contract
    if (opts.contractsCompleted >= 1) this.unlock('first_contract');
    // 10 contracts
    if (opts.contractsCompleted >= 10) this.unlock('ten_contracts');
    // 25 contracts
    if (opts.contractsCompleted >= 25) this.unlock('twenty_five_contracts');
    // Ghost run (0% trace at end)
    if (opts.traceAtEnd === 0) this.unlock('ghost_run');
    // Speed demon: under 90 seconds
    if (opts.connSeconds <= 90) this.unlock('speed_demon');
    // Puzzle first attempt
    if (opts.puzzleFirstAttempt) this.unlock('puzzle_master');
  }

  // ── Act / Story progression ─────────────────────────────

  onActAdvanced(act: StoryAct): void {
    if (act >= StoryAct.Act2) this.unlock('act2_reached');
    if (act >= StoryAct.Act3) this.unlock('act3_reached');
  }

  onHeliosRevealed(): void {
    this.unlock('helios_exposed');
  }

  onEndingSet(ending: GameEndingType): void {
    if (ending === GameEndingType.Ghost)          this.unlock('ending_ghost');
    if (ending === GameEndingType.Whistleblower)  this.unlock('ending_whistleblower');
    if (ending === GameEndingType.Operator)       this.unlock('ending_operator');
  }

  // ── Rig ─────────────────────────────────────────────────

  onRigChanged(): void {
    this.store.select(selectRig).pipe(take(1)).subscribe(rig => {
      if (Object.values(rig).some(v => v >= 5)) this.unlock('rig_hardened');
    });
    this.store.select(selectOwnedSoftware).pipe(take(1)).subscribe(sw => {
      if (sw.length >= 5) this.unlock('full_loadout');
    });
  }

  // ── Faction ─────────────────────────────────────────────

  onFactionChanged(): void {
    this.store.select(selectFactionReps).pipe(take(1)).subscribe(reps => {
      const scores = Object.values(reps).map(r => r.score);
      if (scores.some(s => s >= 50))  this.unlock('faction_allied');
      if (scores.some(s => s <= -50)) this.unlock('faction_rival');
    });
  }

  // ── Economy ─────────────────────────────────────────────

  onCreditsEarned(total: number): void {
    if (total >= 10000) this.unlock('crypto_flush');
    if (total >= 50000) this.unlock('crypto_whale');
  }
}
