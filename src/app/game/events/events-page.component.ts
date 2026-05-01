import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { GameState, DailyChallenge } from '../../core/models/game.models';
import { selectDailyChallenges } from '../../core/store/game.selectors';
import { EventService } from '../../core/services/event.service';

@Component({
  selector: 'app-events-page',
  templateUrl: './events-page.component.html',
  styleUrls: ['./events-page.component.scss'],
  standalone: false
})
export class EventsPageComponent implements OnInit {
  challenges$!: Observable<DailyChallenge[]>;

  constructor(
    private store: Store<{ game: GameState }>,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.eventService.initialize();
    this.challenges$ = this.store.select(selectDailyChallenges);
  }

  progressPercent(challenge: DailyChallenge): number {
    if (challenge.targetValue === 0) return 100;
    return Math.min(100, (challenge.currentValue / challenge.targetValue) * 100);
  }

  timeRemaining(expiresAt: number): string {
    const diff = Math.max(0, expiresAt - Date.now());
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    if (h > 0) return `${h}h ${m}m remaining`;
    if (m > 0) return `${m}m remaining`;
    return 'Expiring soon';
  }

  progressColor(challenge: DailyChallenge): string {
    if (challenge.completed) return 'secondary';
    const pct = this.progressPercent(challenge);
    if (pct >= 75) return 'primary';
    if (pct >= 40) return 'warning';
    return 'medium';
  }
}
