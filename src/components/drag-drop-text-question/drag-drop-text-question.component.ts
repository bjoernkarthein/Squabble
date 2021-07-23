import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-drag-drop-text-question',
  templateUrl: './drag-drop-text-question.component.html',
  styleUrls: ['./drag-drop-text-question.component.scss'],
})
export class DragDropTextQuestionComponent implements OnInit {

  @Input() public text: string;
  @Input() public questionNumber: number;
  @Input() public answerOptions: string[];

  constructor() { }

  ngOnInit() { }

}
