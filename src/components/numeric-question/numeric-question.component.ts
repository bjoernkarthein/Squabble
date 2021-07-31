import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-numeric-question',
  templateUrl: './numeric-question.component.html',
  styleUrls: ['./numeric-question.component.scss'],
})
export class NumericQuestionComponent implements OnInit {

  @Input() public text: string;
  @Input() public questionNumber: number;
  @Output() public changeAnswer = new EventEmitter<string[]>();

  constructor() { }

  ngOnInit() { }

  //TODO: possibly change so answer is not updated on every keystroke
  public inputChange(event: any): void {
    this.changeAnswer.emit([event.target.value]);
  }
}
