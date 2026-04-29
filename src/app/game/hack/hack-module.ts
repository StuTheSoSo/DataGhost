import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HackRoutingModule } from './hack-routing-module';
import { HackPageComponent } from './hack-page.component';
import { PuzzlesModule } from '../../puzzles/puzzles.module';
import { NetworkTopologyComponent } from './network-topology/network-topology.component';

@NgModule({
  declarations: [HackPageComponent, NetworkTopologyComponent],
  imports: [CommonModule, FormsModule, IonicModule, HackRoutingModule, PuzzlesModule]
})
export class HackPageModule {}
