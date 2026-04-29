import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HackPageComponent } from './hack-page.component';

const routes: Routes = [{ path: '', component: HackPageComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HackRoutingModule {}
