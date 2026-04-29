import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { GameState, NpcMessage } from '../../core/models/game.models';
import { selectAllMessages } from '../../core/store/game.selectors';
import * as GameActions from '../../core/store/game.actions';

@Component({
  selector: 'app-inbox-page',
  templateUrl: './inbox-page.component.html',
  styleUrls: ['./inbox-page.component.scss'],
  standalone: false
})
export class InboxPageComponent implements OnInit {
  messages$!: Observable<NpcMessage[]>;
  expandedId: string | null = null;

  constructor(private store: Store<{ game: GameState }>) {}

  ngOnInit(): void {
    this.messages$ = this.store.select(selectAllMessages);
  }

  toggle(msg: NpcMessage): void {
    this.expandedId = this.expandedId === msg.id ? null : msg.id;
    if (!msg.read) {
      this.store.dispatch(GameActions.markMessageRead({ messageId: msg.id }));
    }
  }
}
