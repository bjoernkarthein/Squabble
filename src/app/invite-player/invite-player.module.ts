import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InvitePlayerPageRoutingModule } from './invite-player-routing.module';

import { InvitePlayerPage } from './invite-player.page';
import { ComponentsModule } from 'src/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InvitePlayerPageRoutingModule,
    ComponentsModule
  ],
  declarations: [InvitePlayerPage]
})
export class InvitePlayerPageModule { }
