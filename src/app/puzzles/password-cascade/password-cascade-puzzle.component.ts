import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

interface Clue { label: string; text: string; }

@Component({
  selector: 'app-password-cascade-puzzle',
  template: `
    <div class="pw-puzzle">
      <p class="instruction dg-text-dim">Infer the password from the clues found in the target's environment.</p>
      <div class="clues">
        <div *ngFor="let c of clues" class="clue dg-glass">
          <span class="clue-label dg-text-amber">{{ c.label }}</span>
          <span class="clue-text dg-text-dim">{{ c.text }}</span>
        </div>
      </div>
      <ion-item lines="none" class="pw-input-row">
        <ion-label position="stacked" class="dg-text-dim">PASSWORD</ion-label>
        <ion-input [(ngModel)]="userPassword" type="password" placeholder="enter inferred password"
                   autocorrect="off" autocomplete="off" autocapitalize="none"
                   (keyup.enter)="submit()">
        </ion-input>
      </ion-item>
      <div class="feedback dg-text-red" *ngIf="attempts > 0 && !solved">INCORRECT — {{ 3 - attempts }} attempts left</div>
      <ion-button expand="block" (click)="submit()" [disabled]="!userPassword">ATTEMPT ACCESS</ion-button>
    </div>
  `,
  styles: [`
    .pw-puzzle { display: flex; flex-direction: column; gap: 12px; }
    .clues { display: flex; flex-direction: column; gap: 8px; }
    .clue { padding: 10px 14px; display: flex; flex-direction: column; gap: 4px; }
    .clue-label { font-size: 0.65rem; letter-spacing: 0.12em; }
    .clue-text { font-size: 0.78rem; line-height: 1.5; }
    .pw-input-row { --background: rgba(0,0,0,0.3); --border-radius: 4px; }
    ion-input { font-family: var(--ion-font-family); color: var(--ion-color-primary); }
    .feedback { font-size: 0.72rem; }
    ion-button { --background: var(--ion-color-primary); --color: #000; --border-radius: 4px; }
  `],
  standalone: false
})
export class PasswordCascadePuzzleComponent implements OnInit {
  @Input() difficulty = 5;
  @Output() result = new EventEmitter<boolean>();

  clues: Clue[] = [];
  userPassword = '';
  attempts = 0;
  solved = false;
  private answer = '';

  private challenges: { clues: Clue[]; answer: string }[] = [
    {
      answer: 'Athena2019',
      clues: [
        { label: 'DESK PHOTO', text: 'A goddess was born the year the system came online.', },
        { label: 'EMAIL METADATA', text: 'Creation date points to spring 2019 as the birth year of the key.', },
        { label: 'BROWSER HISTORY', text: 'The user googled advice on strong passwords but never followed it.', }
      ]
    },
    {
      answer: 'Red7Sox',
      clues: [
        { label: 'SPORTS MEMORABILIA', text: 'A worn Boston cap and a framed jersey with the number seven.', },
        { label: 'CHAT LOG', text: 'They bragged that the password is a simple sports reference.', },
        { label: 'IT POLICY NOTE', text: 'The access key must contain at least one digit.', }
      ]
    },
    {
      answer: 'Matrix1999',
      clues: [
        { label: 'SCREENSAVER', text: 'Green rain falling across the screen hints at a famous cyber film.', },
        { label: 'BROWSER BOOKMARK', text: 'A bookmarked page points to the film that defined the genre in 1999.', },
        { label: 'PASSWORD HINT', text: 'The clue reads: "favorite film + year it dropped".', }
      ]
    }
  ];

  ngOnInit(): void {
    const idx = Math.floor(Math.random() * this.challenges.length);
    this.clues = this.challenges[idx].clues;
    this.answer = this.challenges[idx].answer;
  }

  submit(): void {
    this.attempts++;
    if (this.userPassword.trim().toLowerCase() === this.answer.toLowerCase()) {
      this.solved = true;
      this.result.emit(true);
    } else if (this.attempts >= 3) {
      this.result.emit(false);
    }
    this.userPassword = '';
  }
}
