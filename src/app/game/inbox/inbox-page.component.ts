import { Component, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { GameState, NpcMessage } from '../../core/models/game.models';
import { selectAllMessages } from '../../core/store/game.selectors';
import * as GameActions from '../../core/store/game.actions';
import { TutorialService } from '../../core/services/tutorial.service';

@Component({
  selector: 'app-inbox-page',
  templateUrl: './inbox-page.component.html',
  styleUrls: ['./inbox-page.component.scss'],
  standalone: false
})
export class InboxPageComponent implements OnInit {
  messages$!: Observable<NpcMessage[]>;
  expandedId: string | null = null;
  showTutorial = false;
  firstMessageId: string | null = null;
  private subs = new Subscription();

  constructor(
    private store: Store<{ game: GameState }>,
    private tutorial: TutorialService
  ) {}

  ngOnInit(): void {
    this.messages$ = this.store.select(selectAllMessages);
    this.subs.add(this.messages$.subscribe(messages => {
      this.firstMessageId = messages.length ? messages[0].id : null;
    }));
  }

  ionViewWillEnter(): void {
    this.showTutorial = this.tutorial.shouldShow('inbox');
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  toggle(msg: NpcMessage): void {
    this.expandedId = this.expandedId === msg.id ? null : msg.id;
    if (!msg.read) {
      this.store.dispatch(GameActions.markMessageRead({ messageId: msg.id }));
      if (this.showTutorial && msg.id === this.firstMessageId) {
        this.showTutorial = false;
        this.tutorial.complete('inbox');
      }
    }
  }
}
