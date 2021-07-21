import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CourseCardComponent } from './course-card/course-card.component';
import { GeneralQuestionComponent } from './general-question/general-question.component';

@NgModule({
  declarations: [CourseCardComponent, GeneralQuestionComponent],
  imports: [CommonModule],
  exports: [CourseCardComponent, GeneralQuestionComponent]
})
export class ComponentsModule {}
