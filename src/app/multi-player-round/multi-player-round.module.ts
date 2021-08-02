import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MultiPlayerRoundPageRoutingModule } from './multi-player-round-routing.module';

import { MultiPlayerRoundPage } from './multi-player-round.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MultiPlayerRoundPageRoutingModule
  ],
  declarations: [MultiPlayerRoundPage]
})
export class MultiPlayerRoundPageModule {}
