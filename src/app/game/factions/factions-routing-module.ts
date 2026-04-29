import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FactionsPageComponent } from './factions-page.component';

const routes: Routes = [{ path: '', component: FactionsPageComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FactionsRoutingModule {}
