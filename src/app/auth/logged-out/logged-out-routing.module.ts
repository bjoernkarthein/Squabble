import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoggedOutPage } from './logged-out.page';

const routes: Routes = [
  {
    path: '',
    component: LoggedOutPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoggedOutPageRoutingModule {}
