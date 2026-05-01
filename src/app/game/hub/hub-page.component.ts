import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { GameState, StoryAct } from '../../core/models/game.models';
import {
  selectPlayer, selectCredits, selectCurrentAct,
  selectCurrentChapter, selectUnreadCount,
  selectUnlockedAchievements, selectActiveChallenges
} from '../../core/store/game.selectors';
import { TutorialService } from '../../core/services/tutorial.service';
import { EventService } from '../../core/services/event.service';

@Component({
  selector: 'app-hub-page',
  templateUrl: './hub-page.component.html',
  styleUrls: ['./hub-page.component.scss'],
  standalone: false
})
export class HubPageComponent implements OnInit {
  player$!: Observable<any>;
  credits$!: Observable<number>;
  act$!: Observable<StoryAct>;
  chapter$!: Observable<number>;
  unreadCount$!: Observable<number>;
  unlockedAchievementsCount$!: Observable<number>;
  activeChallengesCount$!: Observable<number>;
  showTutorial = false;

  navItems = [
    { label: 'JOB BOARD',    icon: 'list-outline',          route: '/job-board'     },
    { label: 'INBOX',        icon: 'mail-outline',           route: '/inbox'         },
    { label: 'RIG',          icon: 'hardware-chip-outline',  route: '/rig'           },
    { label: 'FACTIONS',     icon: 'people-outline',         route: '/factions'      },
    { label: 'ACHIEVEMENTS', icon: 'trophy-outline',         route: '/achievements'  },
    { label: 'LEADERBOARD',  icon: 'podium-outline',         route: '/leaderboard'   },
    { label: 'DAILY OPS',    icon: 'calendar-outline',       route: '/events'        },
    { label: 'SETTINGS',     icon: 'settings-outline',       route: '/settings'      }
  ];

  constructor(
    private store: Store<{ game: GameState }>,
    public tutorial: TutorialService,
    private router: Router,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.player$      = this.store.select(selectPlayer);
    this.credits$     = this.store.select(selectCredits);
    this.act$         = this.store.select(selectCurrentAct);
    this.chapter$     = this.store.select(selectCurrentChapter);
    this.unreadCount$ = this.store.select(selectUnreadCount);
    this.unlockedAchievementsCount$ = this.store.select(selectUnlockedAchievements).pipe(map(list => list.length));
    this.activeChallengesCount$ = this.store.select(selectActiveChallenges).pipe(map(list => list.length));
    this.eventService.initialize();
  }

  ionViewWillEnter(): void {
    this.showTutorial = this.tutorial.shouldShow('hub');
    this.eventService.initialize();
  }

  async dismissTutorial(): Promise<void> {
    this.showTutorial = false;
    await this.tutorial.complete('hub');
  }

  shouldDisableTile(route: string): boolean {
    const tutorialRoutes = ['/inbox', '/job-board', '/rig'];
    // Only gate tutorial-relevant routes during onboarding
    if (!tutorialRoutes.includes(route)) return false;
    if (this.tutorial.shouldShow('inbox') && route !== '/inbox') return true;
    if (!this.tutorial.shouldShow('inbox') && this.tutorial.shouldShow('firstMissionsDone')
        && route !== '/job-board' && route !== '/inbox') return true;
    if (!this.tutorial.shouldShow('firstMissionsDone') && this.tutorial.shouldShow('rigUpgrade')
        && route !== '/rig') return true;
    return false;
  }

  navigateTo(item: { label: string; icon: string; route: string }): void {
    if (this.shouldDisableTile(item.route)) return;
    this.router.navigate([item.route]);
  }

  actLabel(act: StoryAct): string {
    const labels: Record<StoryAct, string> = {
      [StoryAct.Act0]: 'ACT 0',
      [StoryAct.Act1]: 'ACT 1',
      [StoryAct.Act2]: 'ACT 2',
      [StoryAct.Act3]: 'ACT 3',
      [StoryAct.Sandbox]: 'SANDBOX'
    };
    return labels[act] ?? 'UNKNOWN';
  }
}
