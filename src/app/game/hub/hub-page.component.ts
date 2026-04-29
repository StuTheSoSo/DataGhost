import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { GameState, StoryAct } from '../../core/models/game.models';
import {
  selectPlayer, selectCredits, selectCurrentAct,
  selectCurrentChapter, selectUnreadCount
} from '../../core/store/game.selectors';
import { TutorialService } from '../../core/services/tutorial.service';

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
  showTutorial = false;

  navItems = [
    { label: 'JOB BOARD',   icon: 'list-outline',       route: '/job-board' },
    { label: 'INBOX',       icon: 'mail-outline',        route: '/inbox'     },
    { label: 'RIG',         icon: 'hardware-chip-outline', route: '/rig'     },
    { label: 'FACTIONS',    icon: 'people-outline',      route: '/factions'  },
    { label: 'SETTINGS',    icon: 'settings-outline',    route: '/settings'  }
  ];

  constructor(
    private store: Store<{ game: GameState }>,
    private tutorial: TutorialService
  ) {}

  ngOnInit(): void {
    this.player$      = this.store.select(selectPlayer);
    this.credits$     = this.store.select(selectCredits);
    this.act$         = this.store.select(selectCurrentAct);
    this.chapter$     = this.store.select(selectCurrentChapter);
    this.unreadCount$ = this.store.select(selectUnreadCount);
  }

  ionViewWillEnter(): void {
    this.showTutorial = this.tutorial.shouldShow('hub');
  }

  async dismissTutorial(): Promise<void> {
    this.showTutorial = false;
    await this.tutorial.complete('hub');
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
