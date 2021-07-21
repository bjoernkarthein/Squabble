import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QuizDetailPageRoutingModule } from './quiz-detail-routing.module';

import { QuizDetailPage } from './quiz-detail.page';
import { ComponentsModule } from 'src/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QuizDetailPageRoutingModule,
    ComponentsModule
  ],
  declarations: [QuizDetailPage]
})
export class QuizDetailPageModule { }
