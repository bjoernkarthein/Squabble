import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MultiPlayerRoundPage } from './multi-player-round.page';

const routes: Routes = [
  {
    path: '',
    component: MultiPlayerRoundPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MultiPlayerRoundPageRoutingModule {}
