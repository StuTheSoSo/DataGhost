import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FactionsRoutingModule } from './factions-routing-module';
import { FactionsPageComponent } from './factions-page.component';

@NgModule({
  declarations: [FactionsPageComponent],
  imports: [CommonModule, IonicModule, FactionsRoutingModule]
})
export class FactionsPageModule {}
