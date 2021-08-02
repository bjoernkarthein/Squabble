import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MultiPlayerOverviewPage } from './multi-player-overview.page';

const routes: Routes = [
  {
    path: '',
    component: MultiPlayerOverviewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MultiPlayerOverviewPageRoutingModule {}
