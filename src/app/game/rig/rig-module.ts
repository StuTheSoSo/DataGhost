import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RigRoutingModule } from './rig-routing-module';
import { RigPageComponent } from './rig-page.component';

@NgModule({
  declarations: [RigPageComponent],
  imports: [CommonModule, FormsModule, IonicModule, RigRoutingModule]
})
export class RigPageModule {}
