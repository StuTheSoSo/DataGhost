import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RigPageComponent } from './rig-page.component';

const routes: Routes = [{ path: '', component: RigPageComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RigRoutingModule {}
