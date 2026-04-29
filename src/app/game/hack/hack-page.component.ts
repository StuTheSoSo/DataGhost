import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { AlertController } from '@ionic/angular';
import { GameState, Contract, ContractType, ContractStatus } from '../../core/models/game.models';
import * as GameActions from '../../core/store/game.actions';
import { TraceEngineService, TraceState } from '../../core/services/trace-engine.service';
import { EconomyService } from '../../core/services/economy.service';
import { FactionService } from '../../core/services/faction.service';
import { GameStateService } from '../../core/services/game-state.service';
import { NarrativeService } from '../../core/services/narrative.service';
import { CurrentContractService } from '../../core/services/current-contract.service';

export interface UplinkTool {
  id: string;
  name: string;
  version: string;
  description: string;
  durationMs: number;
  stage: number; // which mission stage this completes
}

@Component({
  selector: 'app-hack-page',
  templateUrl: './hack-page.component.html',
  styleUrls: ['./hack-page.component.scss'],
  standalone: false
})
export class HackPageComponent implements OnInit, OnDestroy {
  contract: Contract | null = null;
  contractId: string | null = null;
  traceState: TraceState = { progress: 0, isActive: false, routeReliability: 0.5 };
  displayTraceProgress = 0;
  routeProgress = 0;

  connected = false;
  currentStage = 0; // 0=idle, 1=entry, 2=auth, 3=objective, 4=done
  tools: UplinkTool[] = [];

  toolRunning = false;
  toolProgress = 0;       // 0-100
  activeToolId: string | null = null;
  private toolTimer: any = null;

  statusLog: string[] = [];
  connSeconds = 0;
  targetIp = '';
  private connClockTimer: any = null;

  puzzleInput = '';
  puzzleSolved = false;
  puzzleError = false;

  get hasPuzzle(): boolean {
    return !!this.contract?.puzzleAnswer;
  }

  checkPuzzle(): void {
    if (!this.contract?.puzzleAnswer) return;
    const answer = this.puzzleInput.trim();
    const expected = this.contract.puzzleAnswer.trim();
    if (answer.toLowerCase() === expected.toLowerCase()) {
      this.puzzleSolved = true;
      this.puzzleError = false;
      this.addLog('Access code verified. Objective unlocked.');
    } else {
      this.puzzleError = true;
      this.addLog('Access code rejected — check the briefing.');
    }
  }

  get connTimeLabel(): string {
    const m = Math.floor(this.connSeconds / 60);
    const s = this.connSeconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  private addLog(msg: string): void {
    const now = new Date();
    const ts = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
    this.statusLog.unshift(`[${ts}] ${msg}`);
    if (this.statusLog.length > 14) this.statusLog.pop();
  }

  private generateIp(): string {
    const rand = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
    return `${rand(50,220)}.${rand(0,255)}.${rand(0,255)}.${rand(1,254)}`;
  }

  routeNodes = [
    { label: 'GATEWAY' },
    { label: 'PRX-1'   },
    { label: 'PRX-2'   },
    { label: 'TARGET'  }
  ];

  get objectiveLabel(): string {
    if (!this.contract) return '';
    switch (this.contract.type) {
      case ContractType.DataTheft:         return 'EXFILTRATE FILE';
      case ContractType.AccountAccess:     return 'CAPTURE SESSION';
      case ContractType.EvidencePlant:     return 'PLANT EVIDENCE';
      case ContractType.TraceClean:        return 'WIPE LOGS';
      case ContractType.Sabotage:          return 'DEPLOY PAYLOAD';
      case ContractType.SocialEngineering: return 'HARVEST TOKENS';
      default:                             return 'COMPLETE OBJECTIVE';
    }
  }

  get currentObjective(): string {
    if (!this.connected) return 'Press CONNECT TO TARGET to begin the mission.';
    if (this.toolRunning) return 'Tool executing — wait for completion. Watch the trace.';
    switch (this.currentStage) {
      case 1: return 'RUN the Connection Scanner or Proxy Bypasser to enter the target network.';
      case 2: return 'RUN the Password Breaker to crack the authentication layer.';
      case 3: return 'ERASE logs first — then execute the payload.';
      case 4: return this.hasPuzzle && !this.puzzleSolved
        ? 'DECODE the access code hidden in the mission brief, then unlock the objective.'
        : 'RUN the objective tool to complete the mission, then disconnect.';
      default: return '';
    }
  }

  get runningToolName(): string {
    return this.tools.find(t => t.id === this.activeToolId)?.name ?? '';
  }

  private subs = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<{ game: GameState }>,
    private trace: TraceEngineService,
    private economy: EconomyService,
    private faction: FactionService,
    private gameState: GameStateService,
    private narrative: NarrativeService,
    private alert: AlertController,
    private currentContract: CurrentContractService
  ) {}

  ngOnInit(): void {
    this.contract = this.currentContract.contract;
    this.contractId = this.contract?.id ?? this.route.snapshot.paramMap.get('contractId');
    if (this.contract) {
      this.buildToolList(this.contract);
      this.targetIp = this.generateIp();
      this.addLog('Uplink OS v2.0 - ready.');
      this.addLog(`Mission loaded: ${this.contract.title}`);
    }

    this.subs.add(
      this.trace.state$.subscribe(s => {
        const prev = this.traceState.progress;
        this.traceState = s;
        if (this.toolRunning) {
          this.displayTraceProgress = s.progress;
        }
        if (s.progress >= 100) this.onTraced();
        if (s.isActive) {
          if (prev < 40 && s.progress >= 40) this.addLog('WARNING: Trace at 40% — act quickly.');
          if (prev < 75 && s.progress >= 75) this.addLog('CRITICAL: Trace at 75% — DISCONNECT NOW.');
        }
      })
    );
  }

  ionViewWillEnter(): void {
    if (this.currentContract.contract) this.contract = this.currentContract.contract;
  }

  ngOnDestroy(): void {
    this.trace.stop();
    clearInterval(this.toolTimer);
    clearInterval(this.connClockTimer);
    this.subs.unsubscribe();
  }

  private buildToolList(c: Contract): void {
    const base = Math.max(2000, c.difficulty * 1200);
    this.tools = [
      {
        id: 'scanner',
        name: 'Connection Scanner',
        version: 'v' + Math.min(3, c.difficulty),
        description: 'Maps open ports and selects the cleanest entry vector.',
        durationMs: base,
        stage: 1
      },
      {
        id: 'bypasser',
        name: 'Proxy Bypasser',
        version: 'v' + Math.min(3, c.difficulty),
        description: 'Tunnels through the firewall without triggering alerts.',
        durationMs: base * 1.2,
        stage: 1
      },
      {
        id: 'passbreak',
        name: 'Password Breaker',
        version: 'v' + Math.min(5, c.difficulty),
        description: 'Dictionary + brute-force hybrid against the auth layer.',
        durationMs: base * 1.5,
        stage: 2
      },
      {
        id: 'logdel',
        name: 'Log Deleter',
        version: 'v' + Math.min(3, c.difficulty),
        description: 'Erases intrusion records from all traversed nodes.',
        durationMs: base * 0.8,
        stage: 3
      },
      {
        id: 'objective',
        name: this.objectiveLabel,
        version: 'v1',
        description: 'Executes the primary mission payload on the target system.',
        durationMs: base * 1.8,
        stage: 4
      }
    ];
  }

  connect(): void {
    if (!this.contract) return;
    this.connected = true;
    this.currentStage = 1;
    this.routeProgress = 0;
    this.trace.start(this.contract.difficulty);
    this.connSeconds = 0;
    this.addLog(`Connecting via ${this.routeNodes.length - 1} proxy nodes...`);
    this.addLog(`Target IP: ${this.targetIp}`);
    this.addLog('Route established. Trace active.');
    this.connClockTimer = setInterval(() => this.connSeconds++, 1000);
  }

  canRun(tool: UplinkTool): boolean {
    if (!this.connected || this.toolRunning) return false;
    if (tool.stage === 1 && this.currentStage === 1) return true;
    if (tool.stage === 2 && this.currentStage === 2) return true;
    if (tool.stage === 3 && this.currentStage === 3) return true;
    if (tool.stage === 4 && this.currentStage === 4) {
      // Puzzle contracts require the code to be solved first
      return !this.hasPuzzle || this.puzzleSolved;
    }
    return false;
  }

  runTool(tool: UplinkTool): void {
    if (!this.canRun(tool)) return;
    this.toolRunning = true;
    this.toolProgress = 0;
    this.activeToolId = tool.id;
    this.displayTraceProgress = this.traceState.progress;
    this.addLog(`Running ${tool.name} ${tool.version}...`);

    const steps = 60;
    const stepMs = tool.durationMs / steps;
    this.toolTimer = setInterval(() => {
      this.toolProgress += 100 / steps;
      this.routeProgress = this.calculateRouteProgress(this.toolProgress);
      if (this.toolProgress >= 100) {
        this.toolProgress = 100;
        this.routeProgress = this.calculateRouteProgress(this.toolProgress);
        clearInterval(this.toolTimer);
        this.onToolComplete(tool);
      }
    }, stepMs);
  }

  private calculateRouteProgress(toolProgress: number): number {
    const stageIndex = Math.min(Math.max(this.currentStage, 1), 3);
    const segmentSize = 100 / 3;
    return Math.min(100, ((stageIndex - 1) * segmentSize) + (toolProgress / 100) * segmentSize);
  }

  private calculateRouteProgressForStage(completedStage: number): number {
    const segmentSize = 100 / 3;
    return Math.min(100, completedStage * segmentSize);
  }

  private onToolComplete(tool: UplinkTool): void {
    this.toolRunning = false;
    this.activeToolId = null;
    this.displayTraceProgress = this.traceState.progress;
    this.addLog(`${tool.name} complete.`);

    // Stage 1 tools: any one of them advances to stage 2 and moves to PRX-1
    if (tool.stage === 1 && this.currentStage === 1) {
      this.currentStage = 2;
      this.routeProgress = this.calculateRouteProgressForStage(tool.stage);
      this.addLog('Entry layer bypassed. Auth layer exposed.');
    }
    // Stage 2: password breaker advances to stage 3 and moves to PRX-2
    else if (tool.stage === 2 && this.currentStage === 2) {
      this.currentStage = 3;
      this.routeProgress = this.calculateRouteProgressForStage(tool.stage);
      this.addLog('Auth cracked. Objective layer accessible.');
    }
    // Stage 3: log deleter — clears tracks, then unlocks target and moves to TARGET
    else if (tool.stage === 3 && this.currentStage === 3) {
      this.currentStage = 4;
      this.routeProgress = this.calculateRouteProgressForStage(tool.stage);
      this.puzzleSolved = false;
      this.puzzleInput = '';
      this.puzzleError = false;
      this.addLog(this.hasPuzzle ? 'Logs erased. Decode the access code to proceed.' : 'Intrusion logs erased. Execute payload.');
    }
    // Stage 4: objective tool — completes mission
    else if (tool.stage === 4 && this.currentStage === 4) {
      this.addLog('Objective complete. Disconnecting...');
      this.completeContract();
    }
  }

  disconnect(): void {
    if (!this.contract) return;
    clearInterval(this.connClockTimer);
    this.trace.stop();
    this.addLog('Manual disconnect. Mission aborted.');
    this.store.dispatch(GameActions.failContract({ contractId: this.contract.id }));
    this.router.navigate(['/job-board'], { replaceUrl: true });
  }

  private async completeContract(): Promise<void> {
    if (!this.contract) return;
    this.connected = false;
    this.trace.stop();
    this.store.dispatch(GameActions.completeContract({ contractId: this.contract.id }));
    this.economy.earn(this.contract.payout, `Contract: ${this.contract.title}`);
    Object.entries(this.contract.repEffects).forEach(([fid, delta]) => {
      this.faction.adjust(fid as any, delta ?? 0);
    });
    this.narrative.setFlag('act1_first_contract', true);
    this.gameState.scheduleAutoSave();

    const a = await this.alert.create({
      header: '// MISSION COMPLETE',
      message: `Disconnected clean. ℂ${this.contract.payout.toLocaleString()} deposited.`,
      buttons: ['DISCONNECT'],
      cssClass: 'dg-alert dg-alert-success'
    });
    await a.present();
    await a.onDidDismiss();
    this.router.navigate(['/job-board'], { replaceUrl: true });
  }

  private async onTraced(): Promise<void> {
    if (!this.contract) return;
    this.connected = false;
    clearInterval(this.toolTimer);
    this.store.dispatch(GameActions.failContract({ contractId: this.contract.id }));
    const a = await this.alert.create({
      header: '// TRACE COMPLETE',
      message: 'Your connection has been traced. Uplink account flagged.',
      buttons: ['ABORT'],
      cssClass: 'dg-alert dg-alert-danger'
    });
    await a.present();
    await a.onDidDismiss();
    this.router.navigate(['/job-board'], { replaceUrl: true });
  }

  goToJobBoard(): void {
    this.router.navigate(['/job-board']);
  }

  stageLabel(s: number): string {
    switch (s) {
      case 1: return 'ENTRY';
      case 2: return 'AUTH';
      case 3: return 'OBJECTIVE';
      default: return '';
    }
  }
}
