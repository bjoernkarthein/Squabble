import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SinglePlayerPage } from './single-player.page';

const routes: Routes = [
  {
    path: '',
    component: SinglePlayerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SinglePlayerPageRoutingModule {}
