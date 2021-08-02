import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MultiPlayerOverviewPageRoutingModule } from './multi-player-overview-routing.module';

import { MultiPlayerOverviewPage } from './multi-player-overview.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MultiPlayerOverviewPageRoutingModule
  ],
  declarations: [MultiPlayerOverviewPage]
})
export class MultiPlayerOverviewPageModule {}
