import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { LeaderboardRoutingModule } from './leaderboard-routing-module';
import { LeaderboardPageComponent } from './leaderboard-page.component';

@NgModule({
  declarations: [LeaderboardPageComponent],
  imports: [CommonModule, IonicModule, LeaderboardRoutingModule]
})
export class LeaderboardPageModule {}
