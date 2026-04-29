import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { GameState, FactionId } from '../../core/models/game.models';
import { selectRevealedFactions } from '../../core/store/game.selectors';
import { FactionService } from '../../core/services/faction.service';

@Component({
  selector: 'app-factions-page',
  templateUrl: './factions-page.component.html',
  styleUrls: ['./factions-page.component.scss'],
  standalone: false
})
export class FactionsPageComponent implements OnInit {
  factions$!: Observable<any[]>;

  factionMeta: Record<FactionId, { label: string; description: string; icon: string }> = {
    [FactionId.DataGhost]: {
      label: 'DATAGHOST',
      description: 'A decentralized collective of idealist hackers. Stateless. They leave no trace.',
      icon: 'ghost-outline'
    },
    [FactionId.EasternNetwork]: {
      label: 'ENS',
      description: 'Eastern Network Syndicate. State-adjacent. Pragmatic. Results matter more than ethics.',
      icon: 'globe-outline'
    },
    [FactionId.WesternAlliance]: {
      label: 'WA',
      description: 'Western Alliance. Operates through proxies. Believes its ideology justifies everything.',
      icon: 'shield-outline'
    },
    [FactionId.Helios]: {
      label: 'HELIOS',
      description: 'A megacorp. No ideology — only leverage. Arms all sides. Profits from chaos.',
      icon: 'warning-outline'
    }
  };

  constructor(
    private store: Store<{ game: GameState }>,
    public faction: FactionService
  ) {}

  ngOnInit(): void {
    this.factions$ = this.store.select(selectRevealedFactions);
  }

  meta(id: FactionId) { return this.factionMeta[id]; }

  repColor(score: number): string {
    if (score >= 40) return 'secondary';
    if (score >= 10) return 'primary';
    if (score >= -10) return 'medium';
    if (score >= -40) return 'warning';
    return 'danger';
  }
}
