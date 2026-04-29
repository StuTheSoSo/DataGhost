import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'app-pattern-intrusion-puzzle',
  template: `
    <div class="pattern-puzzle">
      <p class="instruction dg-text-dim">Identify the logic. What symbol comes next?</p>
      <div class="sequence-display">
        <span *ngFor="let s of sequence; let i = index" class="seq-cell"
              [class.dg-text-cyan]="i < playerProgress"
              [class.dg-text-dim]="i >= playerProgress">
          {{ i < playerProgress ? s : '?' }}
        </span>
      </div>
      <div class="choices">
        <button *ngFor="let c of choices" class="choice-btn dg-glass"
                (click)="pick(c)"
                [disabled]="playerFailed"
                [class.correct]="lastPick === c && lastCorrect === true"
                [class.wrong]="lastPick === c && lastCorrect === false">
          {{ c }}
        </button>
      </div>
      <div class="status">
        <span class="attempts dg-text-amber" *ngIf="attempts > 0">Attempts: {{ attempts }}/3</span>
        <span class="feedback dg-text-red" *ngIf="lastCorrect === false">WRONG — try again</span>
        <span class="feedback dg-text-green" *ngIf="lastCorrect === true && playerProgress < sequence.length">CORRECT!</span>
      </div>
    </div>
  `,
  styles: [`
    .pattern-puzzle { display: flex; flex-direction: column; gap: 14px; }
    .sequence-display { display: flex; gap: 8px; flex-wrap: wrap; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 4px; }
    .seq-cell { font-size: 1.1rem; letter-spacing: 0.15em; width: 32px; text-align: center; }
    .choices { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
    .choice-btn { padding: 12px 4px; font-family: var(--ion-font-family); font-size: 1rem; cursor: pointer; border: 1px solid rgba(0,229,255,0.2); color: #c8d6e5; background: transparent; border-radius: 4px; transition: all 0.2s; }
    .choice-btn:hover:not(:disabled) { border-color: #00e5ff; }
    .choice-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .choice-btn.correct { border-color: #00ff88; color: #00ff88; }
    .choice-btn.wrong { border-color: #ff3d5a; color: #ff3d5a; }
    .status { display: flex; justify-content: space-between; font-size: 0.72rem; }
    .feedback { font-weight: 600; }
  `],
  standalone: false
})
export class PatternIntrusionPuzzleComponent implements OnInit {
  @Input() difficulty = 5;
  @Output() result = new EventEmitter<boolean>();

  sequence: string[] = [];
  choices: string[] = [];
  playerProgress = 0;
  attempts = 3;
  lastPick: string | null = null;
  lastCorrect: boolean | null = null;
  playerFailed = false;

  private symbols = ['▲', '■', '●', '◆', '★', '▼', '◀', '▶'];

  ngOnInit(): void {
    this.generateSequence();
    this.generateChoices();
  }

  private generateSequence(): void {
    const patternType = Math.floor(Math.random() * 5);
    const len = Math.min(6, 3 + Math.floor(this.difficulty / 3));

    if (patternType === 0) {
      // Repeating pattern
      const base = this.symbols.slice(0, 3);
      this.sequence = [];
      for (let i = 0; i < len; i++) {
        this.sequence.push(base[i % base.length]);
      }
    } else if (patternType === 1) {
      // Alternating
      const a = this.symbols[0];
      const b = this.symbols[1];
      this.sequence = [];
      for (let i = 0; i < len; i++) {
        this.sequence.push(i % 2 === 0 ? a : b);
      }
    } else if (patternType === 2) {
      // Increment through list
      this.sequence = this.symbols.slice(0, len).sort(() => Math.random() - 0.5).slice(0, len);
      // Actually just repeat first N symbols in order
      this.sequence = this.symbols.slice(0, Math.min(len, this.symbols.length));
    } else if (patternType === 3) {
      // Symmetry (mirror)
      const half = Math.ceil(len / 2);
      const first = this.symbols.slice(0, half);
      this.sequence = [...first, ...first.slice().reverse()].slice(0, len);
    } else {
      // Simple progression
      this.sequence = Array.from({ length: len }, (_, i) => this.symbols[i % this.symbols.length]);
    }
  }

  generateChoices(): void {
    const correct = this.sequence[this.playerProgress];
    let distractors = this.symbols.filter(s => s !== correct)
      .sort(() => Math.random() - 0.5).slice(0, 3);
    this.choices = [...distractors, correct].sort(() => Math.random() - 0.5);
  }

  pick(val: string): void {
    if (this.playerFailed) return;

    const correct = this.sequence[this.playerProgress];
    this.lastPick = val;

    if (val === correct) {
      this.lastCorrect = true;
      this.playerProgress++;

      if (this.playerProgress >= this.sequence.length) {
        setTimeout(() => this.result.emit(true), 500);
        return;
      }

      setTimeout(() => {
        this.lastPick = null;
        this.lastCorrect = null;
        this.generateChoices();
      }, 500);
    } else {
      this.lastCorrect = false;
      this.attempts--;

      if (this.attempts <= 0) {
        this.playerFailed = true;
        setTimeout(() => {
          this.result.emit(false);
        }, 800);
      } else {
        setTimeout(() => {
          this.lastPick = null;
          this.lastCorrect = null;
        }, 600);
      }
    }
  }
}
