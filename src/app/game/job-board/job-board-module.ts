import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { JobBoardRoutingModule } from './job-board-routing-module';
import { JobBoardPageComponent } from './job-board-page.component';

@NgModule({
  declarations: [JobBoardPageComponent],
  imports: [CommonModule, IonicModule, JobBoardRoutingModule]
})
export class JobBoardPageModule {}
