import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IdentityPageComponent } from './identity-page.component';

const routes: Routes = [{ path: '', component: IdentityPageComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IdentityRoutingModule {}
