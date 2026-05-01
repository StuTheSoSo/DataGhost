import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { GameState, RigStats, SoftwareItem } from '../../core/models/game.models';
import { selectRig, selectOwnedSoftware, selectCredits } from '../../core/store/game.selectors';
import { EconomyService } from '../../core/services/economy.service';
import { TutorialService } from '../../core/services/tutorial.service';
import { AchievementService } from '../../core/services/achievement.service';
import * as GameActions from '../../core/store/game.actions';

interface UpgradeOption { stat: keyof RigStats; label: string; description: string; costPerLevel: number; }

@Component({
  selector: 'app-rig-page',
  templateUrl: './rig-page.component.html',
  styleUrls: ['./rig-page.component.scss'],
  standalone: false
})
export class RigPageComponent implements OnInit {
  rig$!: Observable<RigStats>;
  software$!: Observable<SoftwareItem[]>;
  credits$!: Observable<number>;
  showTutorial = false;

  upgrades: UpgradeOption[] = [
    { stat: 'cpu',       label: 'CPU',       description: 'Extends puzzle timer window',           costPerLevel: 800  },
    { stat: 'ram',       label: 'RAM',       description: 'Additional simultaneous tool slots',    costPerLevel: 1200 },
    { stat: 'bandwidth', label: 'BANDWIDTH', description: 'Reduces trace accumulation rate',       costPerLevel: 1500 }
  ];

  constructor(
    private store: Store<{ game: GameState }>,
    private economy: EconomyService,
    private tutorial: TutorialService,
    private achievement: AchievementService
  ) {}

  ngOnInit(): void {
    this.rig$      = this.store.select(selectRig);
    this.software$ = this.store.select(selectOwnedSoftware);
    this.credits$  = this.store.select(selectCredits);
  }

  ionViewWillEnter(): void {
    this.showTutorial = this.tutorial.shouldShow('rigUpgrade');
  }

  private async completeRigTutorial(): Promise<void> {
    if (this.showTutorial) {
      this.showTutorial = false;
      await this.tutorial.complete('rigUpgrade');
    }
  }

  upgradeStat(stat: keyof RigStats, currentValue: number, costPerLevel: number): void {
    if (currentValue >= 10) return;
    const cost = costPerLevel * currentValue;
    const spent = this.economy.spend(cost, `Upgrade ${stat}`);
    if (spent) {
      this.store.dispatch(GameActions.upgradeRig({ stat, newValue: currentValue + 1 }));
      this.achievement.onRigChanged();
      this.completeRigTutorial();
    }
  }

  upgradeCost(currentValue: number, costPerLevel: number): number {
    return costPerLevel * currentValue;
  }

  upgradeSoftware(item: SoftwareItem): void {
    if (item.tier >= 5) return;
    const cost = this.softwareUpgradeCost(item);
    const spent = this.economy.spend(cost, `Upgrade ${item.name}`);
    if (spent) {
      this.store.dispatch(GameActions.upgradeSoftware({ itemId: item.id, newTier: item.tier + 1 }));
      this.achievement.onRigChanged();
      this.completeRigTutorial();
    }
  }

  softwareUpgradeCost(item: SoftwareItem): number {
    return 1000 * item.tier;
  }

  toggleSoftware(id: string): void {
    this.store.dispatch(GameActions.toggleSoftware({ itemId: id }));
  }
}
