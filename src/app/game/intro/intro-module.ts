import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { IntroRoutingModule } from './intro-routing-module';
import { IntroPageComponent } from './intro-page.component';

@NgModule({
  declarations: [IntroPageComponent],
  imports: [CommonModule, IonicModule, IntroRoutingModule]
})
export class IntroPageModule {}
