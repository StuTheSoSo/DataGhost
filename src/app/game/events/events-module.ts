import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { EventsRoutingModule } from './events-routing-module';
import { EventsPageComponent } from './events-page.component';

@NgModule({
  declarations: [EventsPageComponent],
  imports: [CommonModule, IonicModule, EventsRoutingModule]
})
export class EventsPageModule {}
