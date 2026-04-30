import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { GameState, Contract, ContractType } from '../../core/models/game.models';
import { selectAvailableContracts, selectCurrentChapter } from '../../core/store/game.selectors';
import * as GameActions from '../../core/store/game.actions';
import { TutorialService } from '../../core/services/tutorial.service';
import { CurrentContractService } from '../../core/services/current-contract.service';
import { ContractGeneratorService } from '../../core/services/contract-generator.service';

@Component({
  selector: 'app-job-board-page',
  templateUrl: './job-board-page.component.html',
  styleUrls: ['./job-board-page.component.scss'],
  standalone: false
})
export class JobBoardPageComponent implements OnInit, OnDestroy {
  contracts$!: Observable<Contract[]>;
  sortedContracts$!: Observable<Contract[]>;
  firstContactAvailable$!: Observable<boolean>;
  chapter$!: Observable<number>;
  currentChapter = 1;
  firstContactActive = false;
  tutorialFollowupAvailable = false;
  selectedContract: Contract | null = null;
  showTutorial = false;

  private subs = new Subscription();

  private static isFirstContact(c: Contract): boolean {
    return c.title === 'First Contact — Prove Your Chops';
  }

  private static isTutorialFollowup(c: Contract): boolean {
    return c.title === 'Yellow Token — Archive Audit';
  }

  constructor(
    private store: Store<{ game: GameState }>,
    private tutorial: TutorialService,
    private router: Router,
    private currentContract: CurrentContractService,
    private contractGen: ContractGeneratorService
  ) {}

  ngOnInit(): void {
    this.contracts$ = this.store.select(selectAvailableContracts);
    this.chapter$ = this.store.select(selectCurrentChapter);
    this.sortedContracts$ = this.contracts$.pipe(
      map(cs => [
        ...cs.filter(c => JobBoardPageComponent.isFirstContact(c)),
        ...cs.filter(c => JobBoardPageComponent.isTutorialFollowup(c)),
        ...cs.filter(c => c.isStoryMission && !JobBoardPageComponent.isFirstContact(c)),
        ...cs.filter(c => !c.isStoryMission && !JobBoardPageComponent.isFirstContact(c) && !JobBoardPageComponent.isTutorialFollowup(c))
      ])
    );
    this.firstContactAvailable$ = this.contracts$.pipe(
      map(cs => cs.some(c => JobBoardPageComponent.isFirstContact(c)))
    );
    this.subs.add(
      this.firstContactAvailable$.subscribe(value => this.firstContactActive = value)
    );
    this.subs.add(
      this.contracts$.pipe(
        map(cs => cs.some(c => JobBoardPageComponent.isTutorialFollowup(c)))
      ).subscribe(value => this.tutorialFollowupAvailable = value)
    );
    this.subs.add(
      this.chapter$.subscribe(value => this.currentChapter = value)
    );
  }

  ionViewWillEnter(): void {
    if (this.tutorial.shouldShow('inbox')) {
      this.router.navigate(['/inbox']);
      return;
    }
    if (!this.tutorial.shouldShow('firstMissionsDone') && this.tutorial.shouldShow('rigUpgrade')) {
      this.router.navigate(['/rig']);
      return;
    }
    this.showTutorial = this.tutorial.shouldShow('jobBoard');
    this.topUpContractsIfNeeded();
  }

  private topUpContractsIfNeeded(): void {
    this.store.select(selectAvailableContracts).pipe(
      map(cs => cs.length),
      take(1)
    ).subscribe(count => {
      if (count < 4) {
        const fresh = this.contractGen.generatePool(8);
        this.store.dispatch(GameActions.appendContracts({ contracts: fresh }));
      }
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  async dismissTutorial(): Promise<void> {
    this.showTutorial = false;
    await this.tutorial.complete('jobBoard');
  }

  select(contract: Contract, firstContactActive: boolean): void {
    if (firstContactActive && !JobBoardPageComponent.isFirstContact(contract)) return;
    if (!firstContactActive && this.tutorialFollowupAvailable && !JobBoardPageComponent.isTutorialFollowup(contract)) return;
    this.selectedContract = this.selectedContract?.id === contract.id ? null : contract;
  }

  contractLocked(contract: Contract): boolean {
    if (this.firstContactActive && !JobBoardPageComponent.isFirstContact(contract)) return true;
    if (!this.firstContactActive && this.tutorialFollowupAvailable && !JobBoardPageComponent.isTutorialFollowup(contract)) return true;
    return !!contract.chapterRequirement && this.currentChapter < contract.chapterRequirement;
  }

  accept(): void {
    if (!this.selectedContract || this.contractLocked(this.selectedContract)) return;
    this.store.dispatch(GameActions.startContract({ contractId: this.selectedContract.id }));
    this.currentContract.contract = this.selectedContract;
    this.router.navigate(['/hack', this.selectedContract.id]);
  }

  difficultyBar(d: number): number[] {
    return Array(10).fill(0).map((_, i) => i < d ? 1 : 0);
  }

  typeIcon(type: ContractType): string {
    const map: Record<ContractType, string> = {
      [ContractType.DataTheft]:         'document-outline',
      [ContractType.AccountAccess]:     'person-outline',
      [ContractType.EvidencePlant]:     'create-outline',
      [ContractType.TraceClean]:        'shield-outline',
      [ContractType.Sabotage]:          'flash-outline',
      [ContractType.SocialEngineering]: 'chatbubble-outline'
    };
    return map[type] ?? 'help-outline';
  }

  timeLabel(seconds: number | null): string {
    if (!seconds) return 'NO LIMIT';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }
}
