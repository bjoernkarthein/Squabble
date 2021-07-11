import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LoggedOutPageRoutingModule } from './logged-out-routing.module';

import { LoggedOutPage } from './logged-out.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoggedOutPageRoutingModule
  ],
  declarations: [LoggedOutPage]
})
export class LoggedOutPageModule {}
