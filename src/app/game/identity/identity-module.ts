import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { IdentityRoutingModule } from './identity-routing-module';
import { IdentityPageComponent } from './identity-page.component';

@NgModule({
  declarations: [IdentityPageComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule, IdentityRoutingModule]
})
export class IdentityPageModule {}
