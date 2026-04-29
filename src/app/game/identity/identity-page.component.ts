import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { GameState, OriginArchetype, PlayerIdentity } from '../../core/models/game.models';
import * as GameActions from '../../core/store/game.actions';
import { NarrativeService } from '../../core/services/narrative.service';
import { ContractGeneratorService } from '../../core/services/contract-generator.service';
import { TutorialService } from '../../core/services/tutorial.service';

interface ArchetypeOption {
  id: OriginArchetype;
  label: string;
  tagline: string;
  bonuses: Record<string, number>;
}

@Component({
  selector: 'app-identity-page',
  templateUrl: './identity-page.component.html',
  styleUrls: ['./identity-page.component.scss'],
  standalone: false
})
export class IdentityPageComponent implements OnInit {
  form!: FormGroup;
  selectedArchetype: OriginArchetype | null = null;
  showTutorial = false;

  archetypes: ArchetypeOption[] = [
    {
      id: OriginArchetype.ExMilitary,
      label: 'GHOST OPS',
      tagline: 'Former black-site operative. Discipline over chaos.',
      bonuses: { bandwidth: 2, cpu: 1 }
    },
    {
      id: OriginArchetype.ExCorp,
      label: 'CORP EXILE',
      tagline: 'You built their security. Now you dismantle it.',
      bonuses: { ram: 2, cpu: 1 }
    },
    {
      id: OriginArchetype.SelfTaught,
      label: 'STREETCODE',
      tagline: 'No school. No rules. Pure instinct.',
      bonuses: { cpu: 2, bandwidth: 1 }
    },
    {
      id: OriginArchetype.AcademicDropout,
      label: 'DROPOUT',
      tagline: 'They said you were too dangerous to graduate.',
      bonuses: { ram: 3 }
    }
  ];

  constructor(
    private fb: FormBuilder,
    private store: Store<{ game: GameState }>,
    private narrative: NarrativeService,
    private contractGen: ContractGeneratorService,
    private tutorial: TutorialService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      alias: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20), Validators.pattern(/^[a-zA-Z0-9_\-]+$/)]]
    });
  }

  ionViewWillEnter(): void {
    this.showTutorial = this.tutorial.shouldShow('identity');
  }

  async dismissTutorial(): Promise<void> {
    this.showTutorial = false;
    await this.tutorial.complete('identity');
  }

  selectArchetype(id: OriginArchetype): void {
    this.selectedArchetype = id;
  }

  get selectedOption(): ArchetypeOption | undefined {
    return this.archetypes.find(a => a.id === this.selectedArchetype);
  }

  confirm(): void {
    if (this.form.invalid || !this.selectedArchetype) return;

    const alias = this.form.value.alias.trim();
    const archetype = this.selectedArchetype;
    const option = this.selectedOption!;

    const player: PlayerIdentity = { alias, archetype, statBonuses: option.bonuses };
    this.store.dispatch(GameActions.setPlayerIdentity({ player }));

    // Seed the job board
    const contracts = this.contractGen.generatePool(8);
    this.store.dispatch(GameActions.setContracts({ contracts }));

    // Deliver intro message
    this.narrative.deliverAct0Intro(alias);

    this.router.navigate(['/hub'], { replaceUrl: true });
  }
}
