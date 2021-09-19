import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CourseCardComponent } from './course-card/course-card.component';
import { MultipleChoiceQuestionComponent } from './multiple-choice-question/multiple-choice-question.component';
import { TrueFalseQuestionComponent } from './true-false-question/true-false-question.component';
import { MatchingQuestionComponent } from './matching-question/matching-question.component';
import { NumericQuestionComponent } from './numeric-question/numeric-question.component';
import { ShortAnswerQuestionComponent } from './short-answer-question/short-answer-question.component';
import { DragDropTextQuestionComponent } from './drag-drop-text-question/drag-drop-text-question.component';
import { DraggableComponent } from './draggable/draggable.component';
import { DropZoneComponent } from './drop-zone/drop-zone.component';
import { NotSupportedQuestionComponent } from './not-supported-question/not-supported-question.component';
import { GapSelectQuestionComponent } from './gap-select-question/gap-select-question.component';
import { CrQuestionComponent } from './cr-question/cr-question.component';
import { GamePreviewItemComponent } from './game-preview-item/game-preview-item.component';
import { QuizRoundPreviewComponent } from './quiz-round-preview/quiz-round-preview.component';
import { UserMenuComponent } from './user-menu/user-menu.component';
import { HeaderComponent } from './header/header.component';
import { RouterModule } from '@angular/router';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';
import { GamelistComponent } from './gamelist/gamelist.component';
import { QuizItemComponent } from './quiz-item/quiz-item.component';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [
    CourseCardComponent,
    TrueFalseQuestionComponent,
    MultipleChoiceQuestionComponent,
    MatchingQuestionComponent,
    NumericQuestionComponent,
    ShortAnswerQuestionComponent,
    DragDropTextQuestionComponent,
    DraggableComponent,
    DropZoneComponent,
    NotSupportedQuestionComponent,
    GapSelectQuestionComponent,
    CrQuestionComponent,
    GamePreviewItemComponent,
    QuizRoundPreviewComponent,
    UserMenuComponent,
    HeaderComponent,
    LeaderboardComponent,
    GamelistComponent,
    QuizItemComponent,
  ],
  imports: [CommonModule, FormsModule, RouterModule, IonicModule],
  exports: [
    CourseCardComponent,
    TrueFalseQuestionComponent,
    MultipleChoiceQuestionComponent,
    MatchingQuestionComponent,
    NumericQuestionComponent,
    ShortAnswerQuestionComponent,
    DragDropTextQuestionComponent,
    DraggableComponent,
    DropZoneComponent,
    NotSupportedQuestionComponent,
    GapSelectQuestionComponent,
    CrQuestionComponent,
    GamePreviewItemComponent,
    QuizRoundPreviewComponent,
    UserMenuComponent,
    HeaderComponent,
    LeaderboardComponent,
    GamelistComponent,
    QuizItemComponent,
  ]
})
export class ComponentsModule { }
