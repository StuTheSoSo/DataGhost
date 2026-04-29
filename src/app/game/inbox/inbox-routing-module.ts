import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InboxPageComponent } from './inbox-page.component';

const routes: Routes = [{ path: '', component: InboxPageComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InboxRoutingModule {}
