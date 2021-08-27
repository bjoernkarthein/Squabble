import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MultiPlayerPage } from './multi-player.page';

const routes: Routes = [
  {
    path: '',
    component: MultiPlayerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MultiPlayerPageRoutingModule {}
