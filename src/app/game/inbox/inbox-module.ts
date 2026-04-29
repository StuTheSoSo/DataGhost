import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { InboxRoutingModule } from './inbox-routing-module';
import { InboxPageComponent } from './inbox-page.component';

@NgModule({
  declarations: [InboxPageComponent],
  imports: [CommonModule, IonicModule, InboxRoutingModule]
})
export class InboxPageModule {}
