import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CourseCardComponent } from './course-card/course-card.component';
import { MultipleChoiceQuestionComponent } from './miltiple-choice-question/multiple-choice-question.component';
import { TrueFalseQuestionComponent } from './true-false-question/true-false-question.component';
import { MatchingQuestionComponent } from './matching-question/matching-question.component';
import { NumericQuestionComponent } from './numeric-question/numeric-question.component';
import { ShortAnswerQuestionComponent } from './short-answer-question/short-answer-question.component';
import { DragDropTextQuestionComponent } from './drag-drop-text-question/drag-drop-text-question.component';
import { DraggableComponent } from './draggable/draggable.component';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [
    CourseCardComponent,
    TrueFalseQuestionComponent,
    MultipleChoiceQuestionComponent,
    MatchingQuestionComponent,
    NumericQuestionComponent,
    ShortAnswerQuestionComponent,
    DragDropTextQuestionComponent,
    DraggableComponent
  ],
  imports: [CommonModule, FormsModule, DragDropModule],
  exports: [
    CourseCardComponent,
    TrueFalseQuestionComponent,
    MultipleChoiceQuestionComponent,
    MatchingQuestionComponent,
    NumericQuestionComponent,
    ShortAnswerQuestionComponent,
    DragDropTextQuestionComponent,
    DraggableComponent
  ]
})
export class ComponentsModule { }
