import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

interface CipherChallenge { ciphertext: string; answer: string; hint: string; }

@Component({
  selector: 'app-cipher-puzzle',
  template: `
    <div class="cipher-puzzle">
      <p class="instruction dg-text-dim">Decode the intercepted message. Apply the cipher rule.</p>
      <div class="ciphertext dg-text-amber">{{ challenge.ciphertext }}</div>
      <div class="hint dg-text-dim" *ngIf="showHint">HINT: {{ challenge.hint }}</div>
      <ion-item lines="none" class="input-row">
        <ion-input [(ngModel)]="userAnswer" placeholder="decoded text..." class="answer-input"
                   autocorrect="off" autocomplete="off" spellcheck="false"
                   (keyup.enter)="check()"></ion-input>
      </ion-item>
      <div class="feedback dg-text-red" *ngIf="attempts > 0 && !solved">INCORRECT</div>
      <div class="actions">
        <ion-button fill="outline" size="small" (click)="showHint = true" class="dg-text-dim">HINT</ion-button>
        <ion-button size="small" (click)="check()" [disabled]="!userAnswer">SUBMIT</ion-button>
      </div>
    </div>
  `,
  styles: [`
    .cipher-puzzle { display: flex; flex-direction: column; gap: 12px; }
    .ciphertext { font-size: 1.1rem; letter-spacing: 0.2em; padding: 12px; background: rgba(0,0,0,0.3); border-radius: 4px; word-break: break-all; }
    .hint { font-size: 0.72rem; font-style: italic; }
    .answer-input { font-family: var(--ion-font-family); color: var(--ion-color-primary); }
    .feedback { font-size: 0.72rem; letter-spacing: 0.1em; }
    .actions { display: flex; gap: 8px; justify-content: flex-end; }
    ion-item { --background: rgba(0,0,0,0.3); --border-radius: 4px; }
  `],
  standalone: false
})
export class CipherPuzzleComponent implements OnInit {
  @Input() difficulty = 5;
  @Output() result = new EventEmitter<boolean>();

  challenge!: CipherChallenge;
  userAnswer = '';
  showHint = false;
  attempts = 0;
  solved = false;

  private readonly challenges: CipherChallenge[] = [
    { ciphertext: 'GDWD JKRVW', answer: 'DATA GHOST', hint: 'Caesar +3 shift' },
    { ciphertext: 'KHOLRV LV ZDWFKLQJ', answer: 'HELIOS IS WATCHING', hint: 'Caesar +3 shift' },
    { ciphertext: '01000111 01001000 01001111 01010011 01010100', answer: 'GHOST', hint: 'Binary to ASCII' },
    { ciphertext: '48 45 4C 49 4F 53', answer: 'HELIOS', hint: 'Hex to ASCII' },
    { ciphertext: 'QBIBU HB', answer: 'DATAGHOST', hint: 'ROT13 then remove spaces, pattern: DATA GHOST' }
  ];

  ngOnInit(): void {
    const idx = Math.floor(Math.random() * Math.min(this.difficulty, this.challenges.length));
    this.challenge = this.challenges[idx];
  }

  check(): void {
    this.attempts++;
    if (this.userAnswer.trim().toUpperCase() === this.challenge.answer.toUpperCase()) {
      this.solved = true;
      this.result.emit(true);
    } else if (this.attempts >= 3) {
      this.result.emit(false);
    }
  }
}
