import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-true-false-question',
  templateUrl: './true-false-question.component.html',
  styleUrls: ['./true-false-question.component.scss'],
})
export class TrueFalseQuestionComponent implements OnInit {

  @Input() public text: string;
  @Input() public questionNumber: number;
  @Output() public changeAnswer = new EventEmitter<string[]>();

  constructor() { }

  ngOnInit() { }

  public radioGroupChange(event: any) {
    console.log(event.detail.value);
    this.changeAnswer.emit([event.detail.value]);
  }

}
