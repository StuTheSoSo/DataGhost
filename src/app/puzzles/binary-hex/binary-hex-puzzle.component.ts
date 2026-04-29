import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'app-binary-hex-puzzle',
  template: `
    <div class="binhex-puzzle">
      <p class="instruction dg-text-dim">Decode the value. Determine what the binary/hex sequence represents.</p>
      <div class="encoded-value dg-text-amber">{{ encoded }}</div>
      <p class="question dg-text-dim">{{ question }}</p>
      <div class="options">
        <button *ngFor="let o of options" class="opt-btn dg-glass"
                [class.correct]="picked === o && o === answer"
                [class.wrong]="picked === o && o !== answer"
                (click)="pick(o)">
          {{ o }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .binhex-puzzle { display: flex; flex-direction: column; gap: 14px; }
    .encoded-value { font-size: 0.9rem; letter-spacing: 0.14em; padding: 12px; background: rgba(0,0,0,0.3); border-radius: 4px; word-break: break-all; }
    .question { font-size: 0.78rem; }
    .options { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .opt-btn { padding: 14px 8px; font-family: var(--ion-font-family); font-size: 0.82rem; cursor: pointer; border: 1px solid rgba(0,229,255,0.2); color: #c8d6e5; background: transparent; border-radius: 4px; }
    .opt-btn.correct { border-color: #00ff88; color: #00ff88; }
    .opt-btn.wrong { border-color: #ff3d5a; color: #ff3d5a; }
  `],
  standalone: false
})
export class BinaryHexPuzzleComponent implements OnInit {
  @Input() difficulty = 5;
  @Output() result = new EventEmitter<boolean>();

  encoded = '';
  question = '';
  answer = '';
  options: string[] = [];
  picked: string | null = null;

  private challenges = [
    { enc: '48 45 4C 49 4F 53', q: 'A solar core hides in this packet header. What name does it spell?', ans: 'HELIOS', opts: ['HELIOS', 'GHOSTN', 'ENS-27', 'CIPHER'] },
    { enc: '01000111 01001000', q: 'Two bytes hold the initials of the hacker on standby. What are they?', ans: 'GH', opts: ['GH', 'AB', '47', 'XZ'] },
    { enc: '0x44 0x47', q: 'These hex bytes spell the ghost runner’s initials. What are they?', ans: 'DG', opts: ['DG', 'HE', 'LI', 'OS'] },
    { enc: '1010 0111', q: 'A decimal alert code is hidden in this binary string. What is it?', ans: '167', opts: ['167', '128', '255', '201'] },
    { enc: '0xFF', q: 'Full-strength packet: which decimal value does this hex represent?', ans: '255', opts: ['255', '127', '256', '128'] }
  ];

  ngOnInit(): void {
    const idx = Math.floor(Math.random() * this.challenges.length);
    const c = this.challenges[idx];
    this.encoded = c.enc;
    this.question = c.q;
    this.answer = c.ans;
    this.options = [...c.opts].sort(() => Math.random() - 0.5);
  }

  pick(opt: string): void {
    if (this.picked) return;
    this.picked = opt;
    setTimeout(() => this.result.emit(opt === this.answer), 500);
  }
}
