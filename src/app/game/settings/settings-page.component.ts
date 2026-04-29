import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { GameState } from '../../core/models/game.models';
import { selectIsAdFree } from '../../core/store/game.selectors';
import { AdService } from '../../core/services/ad.service';
import { TutorialService } from '../../core/services/tutorial.service';

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.scss'],
  standalone: false
})
export class SettingsPageComponent implements OnInit {
  isAdFree$!: Observable<boolean>;
  tutorialResetNotice = false;

  constructor(
    private store: Store<{ game: GameState }>,
    private adService: AdService,
    private tutorial: TutorialService
  ) {}

  ngOnInit(): void {
    this.isAdFree$ = this.store.select(selectIsAdFree);
  }

  goAdFree(): void {
    // Dispatch flag via AdService (IAP stub — unlocks immediately in debug builds)
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
}
