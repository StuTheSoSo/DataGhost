import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { GameState, AccessibilitySettings } from '../../core/models/game.models';
import { selectIsAdFree, selectAccessibility } from '../../core/store/game.selectors';
import { AdService } from '../../core/services/ad.service';
import { TutorialService } from '../../core/services/tutorial.service';
import * as GameActions from '../../core/store/game.actions';

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.scss'],
  standalone: false
})
export class SettingsPageComponent implements OnInit {
  isAdFree$!: Observable<boolean>;
  accessibility$!: Observable<AccessibilitySettings>;
  tutorialResetNotice = false;

  constructor(
    private store: Store<{ game: GameState }>,
    private adService: AdService,
    private tutorial: TutorialService
  ) {}

  ngOnInit(): void {
    this.isAdFree$      = this.store.select(selectIsAdFree);
    this.accessibility$ = this.store.select(selectAccessibility);
  }

  goAdFree(): void {
    this.adService.setAdFree(true);
  }

  restore(): void {
    this.adService.restorePurchases();
  }

  async resetTutorials(): Promise<void> {
    await this.tutorial.reset();
    this.tutorialResetNotice = true;
    setTimeout(() => {
      this.tutorialResetNotice = false;
    }, 2200);
  }

  toggleColorblind(current: AccessibilitySettings): void {
    const updated = { ...current, colorblindMode: !current.colorblindMode };
    this.store.dispatch(GameActions.setAccessibility({ settings: updated }));
    this.applyBodyClasses(updated);
  }

  toggleLargeFont(current: AccessibilitySettings): void {
    const updated = { ...current, largeFontMode: !current.largeFontMode };
    this.store.dispatch(GameActions.setAccessibility({ settings: updated }));
    this.applyBodyClasses(updated);
  }

  private applyBodyClasses(settings: AccessibilitySettings): void {
    document.body.classList.toggle('dg-colorblind', settings.colorblindMode);
    document.body.classList.toggle('dg-large-font', settings.largeFontMode);
  }

  sendFeedback(): void {
    window.open('mailto:feedback@dataghost.app?subject=DataGhost%20Feedback', '_system');
  }
}

