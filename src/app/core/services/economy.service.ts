import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { GameState } from '../models/game.models';
import * as GameActions from '../store/game.actions';
import { selectCredits } from '../store/game.selectors';

@Injectable({ providedIn: 'root' })
export class EconomyService {
  readonly credits$: Observable<number>;

  constructor(private store: Store<{ game: GameState }>) {
    this.credits$ = this.store.select(selectCredits);
  }

  earn(amount: number, reason: string): void {
    if (amount <= 0) return;
    this.store.dispatch(GameActions.earnCredits({ amount, reason }));
  }

  spend(amount: number, reason: string): boolean {
    let canAfford = false;
    let current = 0;
    this.credits$.subscribe(c => current = c).unsubscribe();
    canAfford = current >= amount;
    if (canAfford) {
      this.store.dispatch(GameActions.spendCredits({ amount, reason }));
    }
    return canAfford;
  }

  canAfford(amount: number): Observable<boolean> {
    return new Observable(observer => {
      this.credits$.subscribe(c => {
        observer.next(c >= amount);
      });
    });
  }
}
