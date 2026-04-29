import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HubRoutingModule } from './hub-routing-module';
import { HubPageComponent } from './hub-page.component';

@NgModule({
  declarations: [HubPageComponent],
  imports: [CommonModule, IonicModule, HubRoutingModule]
})
export class HubPageModule {}
