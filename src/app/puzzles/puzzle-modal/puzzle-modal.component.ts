import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PuzzleType } from '../../core/models/game.models';

@Component({
  selector: 'app-puzzle-modal',
  templateUrl: './puzzle-modal.component.html',
  styleUrls: ['./puzzle-modal.component.scss'],
  standalone: false
})
export class PuzzleModalComponent implements OnInit {
  @Input() puzzleType!: PuzzleType;
  @Input() difficulty = 5;
  @Input() stageLabel?: string;
  @Input() stageDescription?: string;

  PuzzleType = PuzzleType;
  timeLeft = 60;
  private timer: any;

  constructor(private modalCtrl: ModalController) {}

  ngOnInit(): void {
    this.timeLeft = Math.max(20, 80 - this.difficulty * 5);
    this.timer = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) this.dismiss(false);
    }, 1000);
  }

  onPuzzleResult(success: boolean): void {
    clearInterval(this.timer);
    this.dismiss(success);
  }

  dismiss(success: boolean): void {
    clearInterval(this.timer);
    this.modalCtrl.dismiss({ success });
  }

  get timerColor(): string {
    if (this.timeLeft <= 10) return 'danger';
    if (this.timeLeft <= 20) return 'warning';
    return 'primary';
  }
}
