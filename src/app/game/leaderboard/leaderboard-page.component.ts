import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { GameState, LeaderboardEntry } from '../../core/models/game.models';
import { selectLeaderboard, selectPlayer, selectStats } from '../../core/store/game.selectors';
import { LeaderboardService } from '../../core/services/leaderboard.service';
import { combineLatest, map } from 'rxjs';

@Component({
  selector: 'app-leaderboard-page',
  templateUrl: './leaderboard-page.component.html',
  styleUrls: ['./leaderboard-page.component.scss'],
  standalone: false
})
export class LeaderboardPageComponent implements OnInit {
  leaderboard$!: Observable<LeaderboardEntry[]>;
  currentPlayerAlias$!: Observable<string | null>;
  submitted = false;

  constructor(
    private store: Store<{ game: GameState }>,
    private leaderboardService: LeaderboardService
  ) {}

  ngOnInit(): void {
    this.leaderboard$ = this.store.select(selectLeaderboard);
    this.currentPlayerAlias$ = this.store.select(selectPlayer).pipe(
      map(p => p?.alias ?? null)
    );
  }

  submitScore(): void {
    this.leaderboardService.submitCurrentScore();
    this.submitted = true;
  }

  isCurrentPlayer(entry: LeaderboardEntry, alias: string | null): boolean {
    return alias !== null && entry.alias === alias;
  }

  formatDate(ts: number): string {
    return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  rank(index: number): string {
    const medals = ['#1', '#2', '#3'];
    return medals[index] ?? `#${index + 1}`;
  }
}
