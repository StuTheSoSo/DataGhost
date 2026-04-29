import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { Store } from '@ngrx/store';
import { GameState } from '../models/game.models';
import * as GameActions from '../store/game.actions';

const SAVE_KEY = 'dg_game_state';

@Injectable({ providedIn: 'root' })
export class GameStateService {
  private currentState: GameState | null = null;

  constructor(private store: Store<{ game: GameState }>) {
    this.store.select(s => s.game).subscribe(state => {
      this.currentState = state;
    });
  }

  async save(): Promise<void> {
    if (!this.currentState) return;
    const serialized = JSON.stringify(this.currentState);
    await Preferences.set({ key: SAVE_KEY, value: serialized });
    this.store.dispatch(GameActions.gameSaved({ timestamp: Date.now() }));
  }

  async load(): Promise<void> {
    try {
      const { value } = await Preferences.get({ key: SAVE_KEY });
      if (value) {
        const parsed: Partial<GameState> = JSON.parse(value);
        this.store.dispatch(GameActions.loadSavedGameSuccess({ state: parsed }));
      } else {
        this.store.dispatch(GameActions.loadSavedGameFailure());
      }
    } catch {
      this.store.dispatch(GameActions.loadSavedGameFailure());
    }
  }

  async clearSave(): Promise<void> {
    await Preferences.remove({ key: SAVE_KEY });
  }

  /** Auto-save on every contract completion — call from effects or components */
  scheduleAutoSave(delayMs = 2000): void {
    setTimeout(() => this.save(), delayMs);
  }
}
