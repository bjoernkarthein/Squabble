import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MultiPlayerPageRoutingModule } from './multi-player-routing.module';

import { MultiPlayerPage } from './multi-player.page';
import { ComponentsModule } from 'src/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MultiPlayerPageRoutingModule,
    ComponentsModule
  ],
  declarations: [MultiPlayerPage]
})
export class MultiPlayerPageModule { }
