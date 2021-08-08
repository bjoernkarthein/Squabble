import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-matching-question',
  templateUrl: './matching-question.component.html',
  styleUrls: ['./matching-question.component.scss'],
})
export class MatchingQuestionComponent implements OnInit {

  @Input() public text: string[];
  @Input() public questionNumber: number;
  @Input() public gapText: string[];
  @Input() public answerOptions: string[];
  @Input() public rightAnswers: string[] = [];

  @Output() public setRightAnswer = new EventEmitter<string>();
  @Output() public changeAnswer = new EventEmitter<string[]>();

  private selectedAnswers: string[] = [];

  constructor() { }

  ngOnInit() {
    for (const g of this.gapText) {
      this.selectedAnswers.push('0');
    }
    this.changeAnswer.emit(this.selectedAnswers);

    let rightAnswer = '';

    console.log(this.answerOptions);
    console.log(this.rightAnswers);

    for (let i = 0; i < this.rightAnswers.length; i++) {
      rightAnswer += (this.answerOptions.indexOf(this.rightAnswers[i]) + 1).toString() + (i < this.rightAnswers.length - 1 ? '###' : '');
    }
    console.log(rightAnswer);
    this.setRightAnswer.emit(rightAnswer);
  }

  public selectChange(event: any): void {
    const value = this.answerOptions.indexOf(event.detail.value);
    const index = event.target.id;
    this.selectedAnswers[index] = (value + 1).toString();
    this.changeAnswer.emit(this.selectedAnswers);
  }

}
