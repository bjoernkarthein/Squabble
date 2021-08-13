import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FindPlayerPageRoutingModule } from './find-player-routing.module';

import { FindPlayerPage } from './find-player.page';
import { ComponentsModule } from 'src/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FindPlayerPageRoutingModule,
    ComponentsModule
  ],
  declarations: [FindPlayerPage]
})
export class FindPlayerPageModule { }
