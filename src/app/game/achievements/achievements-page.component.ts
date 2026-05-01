import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { GameState, Achievement, AchievementCategory } from '../../core/models/game.models';
import { selectAchievements } from '../../core/store/game.selectors';

@Component({
  selector: 'app-achievements-page',
  templateUrl: './achievements-page.component.html',
  styleUrls: ['./achievements-page.component.scss'],
  standalone: false
})
export class AchievementsPageComponent implements OnInit {
  achievements$!: Observable<Achievement[]>;

  categories: { id: AchievementCategory; label: string }[] = [
    { id: AchievementCategory.Story,       label: 'STORY' },
    { id: AchievementCategory.Skill,       label: 'SKILL' },
    { id: AchievementCategory.Progression, label: 'PROGRESSION' },
    { id: AchievementCategory.Economy,     label: 'ECONOMY' },
    { id: AchievementCategory.Faction,     label: 'FACTION' }
  ];

  constructor(private store: Store<{ game: GameState }>) {}

  ngOnInit(): void {
    this.achievements$ = this.store.select(selectAchievements);
  }

  byCategory(achievements: Achievement[], categoryId: AchievementCategory): Achievement[] {
    return achievements.filter(a => a.category === categoryId);
  }

  unlockedCount(achievements: Achievement[]): number {
    return achievements.filter(a => a.unlockedAt !== null).length;
  }

  formatDate(ts: number | null): string {
    if (!ts) return '';
    return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
