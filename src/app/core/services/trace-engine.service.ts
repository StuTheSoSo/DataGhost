import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, interval, Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { filter, take } from 'rxjs/operators';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { GameState, RigStats, ProxyNode } from '../models/game.models';
import * as GameActions from '../store/game.actions';
import { selectActiveRoute, selectRig } from '../store/game.selectors';

export interface TraceState {
  progress: number;   // 0-100
  isActive: boolean;
  routeReliability: number; // 0-1 composite
}

@Injectable({ providedIn: 'root' })
export class TraceEngineService {
  private stop$ = new Subject<void>();
  private traceProgress = 0;
  private traceActive = false;

  /** Emits once when trace reaches 100% */
  readonly traced$ = new Subject<void>();

  readonly state$: Observable<TraceState>;

  private rig: RigStats = { cpu: 1, ram: 1, bandwidth: 1 };
  private routeNodes: ProxyNode[] = [];

  constructor(private store: Store<{ game: GameState }>) {
    this.store.select(selectRig).subscribe(rig => this.rig = rig);
    this.store.select(selectActiveRoute).subscribe(nodes => {
      this.routeNodes = (nodes as ProxyNode[]).filter(Boolean);
    });

    this.state$ = new Observable(observer => {
      const sub = interval(500).subscribe(() => {
        observer.next(this.currentState());
      });
      return () => sub.unsubscribe();
    });
  }

  /** Start a trace tick loop for an active contract */
  start(baseDifficulty: number, expectedDurationMs?: number, act?: number): void {
    this.traceActive = true;
    this.traceProgress = 0;
    this.stop$ = new Subject<void>();

    const tickRate = this.calcTickRate(baseDifficulty, expectedDurationMs, act);

    interval(500)
      .pipe(takeUntil(this.stop$))
      .subscribe(() => {
        this.traceProgress = Math.min(100, this.traceProgress + tickRate);
        if (this.traceProgress >= 100) {
          this.onTraceFull();
        }
        if (this.traceProgress >= 70 && this.traceProgress < 72) {
          Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
        }
      });
  }

  stop(): void {
    this.traceActive = false;
    this.traceProgress = 0;
    this.stop$.next();
    this.stop$.complete();
  }

  /** Reduce trace progress (wiper tool effect) */
  reduceTrace(amount: number): void {
    this.traceProgress = Math.max(0, this.traceProgress - amount);
  }

  /** Apply a decoy — temporarily pause trace accumulation */
  deployDecoy(durationMs: number): void {
    const saved$ = this.stop$;
    const pause$ = new Subject<void>();
    this.stop$ = pause$;
    setTimeout(() => {
      pause$.next();
      pause$.complete();
      this.stop$ = saved$;
    }, durationMs);
  }

  currentState(): TraceState {
    return {
      progress: this.traceProgress,
      isActive: this.traceActive,
      routeReliability: this.calcRouteReliability()
    };
  }

  /** Punish on failed puzzle — spike trace */
  penalize(amount = 15): void {
    this.traceProgress = Math.min(100, this.traceProgress + amount);
    Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => {});
  }

  private calcTickRate(difficulty: number, expectedDurationMs?: number, act?: number): number {
    const reliability = this.calcRouteReliability();
    // Low-difficulty missions get extra breathing room: diff 1 = 3×, diff 2 = 2×, diff 3+ = 1×
    const beginnerMultiplier = difficulty <= 2 ? (4 - difficulty) : 1;
    // Act 1 gets 2.5× more time, Act 2 gets 1.75× more time
    const actMultiplier = act === 1 ? 2.5 : act === 2 ? 1.75 : 1;
    const timeSec = Math.max(20, (expectedDurationMs ?? 30000) / 1000 * 1.3 * beginnerMultiplier * actMultiplier);
    const baseRate = 50 / timeSec;
    const difficultyPressure = 1 + (difficulty - 1) * 0.05;
    const unreliabilityBonus = (1 - reliability) * 1.5;
    return Math.max(0.35, Math.min(12, baseRate * difficultyPressure + unreliabilityBonus));
  }

  private calcRouteReliability(): number {
    if (!this.routeNodes.length) return 0.5;
    const avg = this.routeNodes.reduce((sum, n) => sum + n.reliability, 0) / this.routeNodes.length;
    return avg;
  }

  private onTraceFull(): void {
    this.stop();
    Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => {});
    this.traced$.next();
  }

  get isTraced(): boolean {
    return this.traceProgress >= 100;
  }
}
