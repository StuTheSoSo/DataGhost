import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AchievementsRoutingModule } from './achievements-routing-module';
import { AchievementsPageComponent } from './achievements-page.component';

@NgModule({
  declarations: [AchievementsPageComponent],
  imports: [CommonModule, IonicModule, AchievementsRoutingModule]
})
export class AchievementsPageModule {}
