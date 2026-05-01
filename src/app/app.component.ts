import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { GameState } from './core/models/game.models';
import { GameStateService } from './core/services/game-state.service';
import { AdService } from './core/services/ad.service';
import { TutorialService } from './core/services/tutorial.service';
import { EventService } from './core/services/event.service';
import { selectIsInitialized, selectPlayer, selectAccessibility } from './core/store/game.selectors';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  constructor(
    private store: Store<{ game: GameState }>,
    private gameState: GameStateService,
    private adService: AdService,
    private tutorial: TutorialService,
    private eventService: EventService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    await this.tutorial.initialize();
    await this.adService.initialize();
    await this.gameState.load();

    // Apply saved accessibility settings to the document body
    this.store.select(selectAccessibility).subscribe(a11y => {
      document.body.classList.toggle('dg-colorblind', a11y?.colorblindMode ?? false);
      document.body.classList.toggle('dg-large-font', a11y?.largeFontMode ?? false);
    });

    this.eventService.initialize();

    combineLatest([
      this.store.select(selectIsInitialized),
      this.store.select(selectPlayer)
    ]).pipe(
      filter(([initialized]) => initialized),
      take(1)
    ).subscribe(([, player]) => {
      if (player) {
        this.router.navigate(['/hub'], { replaceUrl: true });
      } else if (this.tutorial.shouldShow('worldIntro')) {
        this.router.navigate(['/intro'], { replaceUrl: true });
      } else {
        this.router.navigate(['/identity'], { replaceUrl: true });
      }
    });
  }
}
