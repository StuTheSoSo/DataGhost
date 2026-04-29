import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Preferences } from '@capacitor/preferences';
import { GameState } from '../models/game.models';
import * as GameActions from '../store/game.actions';
import { selectIsAdFree } from '../store/game.selectors';

const AD_FREE_KEY = 'dg_ad_free';

@Injectable({ providedIn: 'root' })
export class AdService {
  isAdFree = false;

  constructor(private store: Store<{ game: GameState }>) {
    this.store.select(selectIsAdFree).subscribe(v => this.isAdFree = v);
  }

  async initialize(): Promise<void> {
    const { value } = await Preferences.get({ key: AD_FREE_KEY });
    if (value === 'true') {
      this.store.dispatch(GameActions.setAdFree({ adFree: true }));
    }
    // AdMob initialization is handled at the app component level via the plugin
  }

  async setAdFree(value: boolean): Promise<void> {
    await Preferences.set({ key: AD_FREE_KEY, value: String(value) });
    this.store.dispatch(GameActions.setAdFree({ adFree: value }));
  }

  async restorePurchases(): Promise<void> {
    // Stub: re-read persisted ad-free flag (real IAP restore would call the store here)
    await this.initialize();
  }
}
