import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InvitePlayerPage } from './invite-player.page';

const routes: Routes = [
  {
    path: '',
    component: InvitePlayerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvitePlayerPageRoutingModule {}
