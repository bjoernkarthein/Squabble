import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FindPlayerPage } from './find-player.page';

const routes: Routes = [
  {
    path: '',
    component: FindPlayerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FindPlayerPageRoutingModule {}
