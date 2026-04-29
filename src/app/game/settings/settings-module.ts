import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SettingsRoutingModule } from './settings-routing-module';
import { SettingsPageComponent } from './settings-page.component';

@NgModule({
  declarations: [SettingsPageComponent],
  imports: [CommonModule, IonicModule, SettingsRoutingModule]
})
export class SettingsPageModule {}

