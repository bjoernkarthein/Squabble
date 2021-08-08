import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-short-answer-question',
  templateUrl: './short-answer-question.component.html',
  styleUrls: ['./short-answer-question.component.scss'],
})
export class ShortAnswerQuestionComponent implements OnInit {

  @Input() public text: string;
  @Input() public questionNumber: number;
  @Input() public rightAnswer: string;

  @Output() public setRightAnswer = new EventEmitter<string>();
  @Output() public changeAnswer = new EventEmitter<string[]>();

  constructor() { }

  ngOnInit() {
    this.changeAnswer.emit([' ']);
    this.setRightAnswer.emit(this.rightAnswer);
  }

  //TODO: possibly change so answer is not updated on every keystroke
  public inputChange(event: any): void {
    this.changeAnswer.emit([event.target.value]);
  }

}
