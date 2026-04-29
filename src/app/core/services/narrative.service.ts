import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { GameState, StoryAct, FactionId, GameEndingType, NpcMessage } from '../models/game.models';
import * as GameActions from '../store/game.actions';
import { selectCurrentChapter, selectCurrentAct, selectFactionReps, selectStoryFlags } from '../store/game.selectors';

export interface StoryMilestone {
  id: string;
  chapter: number;
  act: StoryAct;
  triggerFlag: string;
  description: string;
  onTrigger: (service: NarrativeService) => void;
}

@Injectable({ providedIn: 'root' })
export class NarrativeService {
  private chapter = 0;
  private act: StoryAct = StoryAct.Act0;
  private storyFlags: Record<string, any> = {};
  private factionReps: any = {};

  constructor(private store: Store<{ game: GameState }>) {
    this.store.select(selectCurrentChapter).subscribe(c => this.chapter = c);
    this.store.select(selectCurrentAct).subscribe(a => this.act = a);
    this.store.select(selectStoryFlags).subscribe(f => this.storyFlags = f);
    this.store.select(selectFactionReps).subscribe(r => this.factionReps = r);
  }

  setFlag(key: string, value: boolean | string | number): void {
    this.store.dispatch(GameActions.setStoryFlag({ key, value }));
    this.evaluateMilestones();
  }

  getFlag(key: string): any {
    return this.storyFlags[key]?.value ?? null;
  }

  advanceTo(chapter: number, act: StoryAct): void {
    this.store.dispatch(GameActions.advanceChapter({ chapter, act }));
  }

  deliverMessage(message: Omit<NpcMessage, 'id' | 'timestamp' | 'read'>): void {
    const msg: NpcMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      timestamp: Date.now(),
      read: false
    };
    this.store.dispatch(GameActions.addMessage({ message: msg }));
  }

  evaluateMilestones(): void {
    // Act 1 → Act 2 transition: 4 contracts done + first story flag
    if (this.act === StoryAct.Act1 && this.chapter >= 4) {
      if (this.getFlag('act1_signal_found')) {
        this.advanceTo(5, StoryAct.Act2);
        this.deliverMessage({
          fromAlias: 'VECTOR',
          factionId: FactionId.DataGhost,
          subject: '// PRIORITY — read this',
          body: 'The last target wasn\'t who they said. I traced the contract source. It leads somewhere you don\'t want it to. Meet at the dead drop.',
          isStoryTrigger: true,
          storyFlag: 'act2_started'
        });
        this.store.dispatch(GameActions.revealFaction({ factionId: FactionId.Helios }));
      }
    }

    // Act 2 → Act 3 transition
    if (this.act === StoryAct.Act2 && this.chapter >= 9) {
      if (this.getFlag('helios_identified') && this.getFlag('faction_choice_made')) {
        this.advanceTo(10, StoryAct.Act3);
        this.deliverMessage({
          fromAlias: 'UNKNOWN',
          factionId: FactionId.Helios,
          subject: 'We know who you are.',
          body: 'DataGhost. We\'ve been watching since Act One. You should have stayed anonymous. Helios doesn\'t forgive interference.',
          isStoryTrigger: true,
          storyFlag: 'act3_started'
        });
      }
    }

    // Ending evaluation
    if (this.act === StoryAct.Act3 && this.chapter >= 12) {
      this.evaluateEnding();
    }
  }

  private evaluateEnding(): void {
    const dgRep = this.factionReps[FactionId.DataGhost]?.score ?? 0;
    const waRep = this.factionReps[FactionId.WesternAlliance]?.score ?? 0;
    const ensRep = this.factionReps[FactionId.EasternNetwork]?.score ?? 0;
    const leaked = this.getFlag('helios_data_leaked');
    const destroyed = this.getFlag('helios_destroyed');
    const leveraged = this.getFlag('helios_leveraged');

    let ending = GameEndingType.Ghost;
    if (leaked && dgRep >= 50) ending = GameEndingType.Whistleblower;
    else if (leveraged && Math.max(waRep, ensRep) < 0) ending = GameEndingType.Operator;

    this.store.dispatch(GameActions.setEnding({ ending }));
    this.advanceTo(13, StoryAct.Sandbox);
  }

  // ── Act 0 story intro messages ────────────────────────────
  deliverAct0Intro(alias: string): void {
    this.deliverMessage({
      fromAlias: 'VECTOR',
      factionId: FactionId.DataGhost,
      subject: 'You\'ve been found.',
      body: `${alias}. That\'s what they call you. I call you an opportunity.\n\nWe are DataGhost. We don\'t exist. You don\'t either — not anymore.\n\nFirst job is on the board. Low-risk. Prove yourself.\n\n—V`,
      isStoryTrigger: true,
      storyFlag: 'act0_intro_delivered'
    });
  }
}
