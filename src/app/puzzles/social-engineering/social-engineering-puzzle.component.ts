import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

interface DialogNode {
  id: string;
  npcLine: string;
  choices: { text: string; nextId: string | null; isCorrect: boolean; }[];
}

@Component({
  selector: 'app-social-engineering-puzzle',
  template: `
    <div class="social-puzzle">
      <div class="npc-header">
        <ion-icon name="person-circle-outline" class="dg-text-dim npc-icon"></ion-icon>
        <span class="npc-name dg-text-dim">TARGET :: {{ npcName }}</span>
      </div>
      <div class="npc-bubble dg-glass">
        <p>{{ currentNode.npcLine }}</p>
      </div>
      <div class="choices">
        <button *ngFor="let c of currentNode.choices" class="choice-btn dg-glass"
                (click)="choose(c)">
          &gt; {{ c.text }}
        </button>
      </div>
      <div class="feedback dg-text-red" *ngIf="failed">SUSPICIOUS — target is alert</div>
    </div>
  `,
  styles: [`
    .social-puzzle { display: flex; flex-direction: column; gap: 12px; }
    .npc-header { display: flex; align-items: center; gap: 8px; font-size: 0.72rem; letter-spacing: 0.1em; }
    .npc-icon { font-size: 1.4rem; }
    .npc-bubble { padding: 14px; font-size: 0.82rem; line-height: 1.6; }
    .choices { display: flex; flex-direction: column; gap: 8px; }
    .choice-btn { text-align: left; padding: 12px 14px; font-family: var(--ion-font-family); font-size: 0.78rem; cursor: pointer; border: 1px solid rgba(0,229,255,0.15); color: #c8d6e5; background: transparent; border-radius: 4px; line-height: 1.4; }
    .choice-btn:active { border-color: var(--ion-color-primary); }
    .feedback { font-size: 0.72rem; }
  `],
  standalone: false
})
export class SocialEngineeringPuzzleComponent implements OnInit {
  @Input() difficulty = 5;
  @Output() result = new EventEmitter<boolean>();

  npcName = '';
  currentNode!: DialogNode;
  failed = false;

  private npcNames = ['J. Mercer', 'S. Okonkwo', 'T. Voss', 'L. Hartmann', 'K. Nair'];

  private dialog: DialogNode[] = [
    {
      id: 'start',
      npcLine: 'IT helpdesk? I didn\'t submit a ticket...',
      choices: [
        { text: 'Proactive sweep — we detected anomalous traffic from your endpoint.', nextId: 'mid', isCorrect: true },
        { text: 'Yes you did. Check your sent folder.', nextId: null, isCorrect: false },
        { text: 'Doesn\'t matter, I need your credentials.', nextId: null, isCorrect: false }
      ]
    },
    {
      id: 'mid',
      npcLine: 'I\'m busy. What do you actually need?',
      choices: [
        { text: 'Two minutes of your time to verify your SSO token hasn\'t been compromised.', nextId: 'confirm', isCorrect: true },
        { text: 'Your password, reset it now or get locked out.', nextId: null, isCorrect: false },
        { text: 'Access to your workstation remotely.', nextId: null, isCorrect: false }
      ]
    },
    {
      id: 'confirm',
      npcLine: 'Fine. What do you need me to do?',
      choices: [
        { text: 'Just confirm your current token — last 4 digits only, standard verification.', nextId: null, isCorrect: true },
        { text: 'Give me your full login credentials.', nextId: null, isCorrect: false },
        { text: 'Nothing, I\'m good now.', nextId: null, isCorrect: false }
      ]
    }
  ];

  ngOnInit(): void {
    this.npcName = this.npcNames[Math.floor(Math.random() * this.npcNames.length)];
    this.currentNode = this.dialog[0];
  }

  choose(choice: { text: string; nextId: string | null; isCorrect: boolean }): void {
    if (!choice.isCorrect) {
      this.failed = true;
      setTimeout(() => this.result.emit(false), 800);
      return;
    }
    if (choice.nextId === null) {
      // End of correct path
      setTimeout(() => this.result.emit(true), 300);
      return;
    }
    const next = this.dialog.find(n => n.id === choice.nextId);
    if (next) this.currentNode = next;
  }
}
