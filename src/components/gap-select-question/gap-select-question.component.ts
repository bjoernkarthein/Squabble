import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-gap-select-question',
  templateUrl: './gap-select-question.component.html',
  styleUrls: ['./gap-select-question.component.scss'],
})
export class GapSelectQuestionComponent implements OnInit, AfterViewInit {
  @Input() public questionNumber: number;
  @Input() public snippets: string[];
  @Input() public answerOptions: string[];
  @Input() public rightAnswers: string[] = [];

  @Output() public setRightAnswer = new EventEmitter<string>();
  @Output() public changeAnswer = new EventEmitter<string[]>();

  private selectedAnswers: string[] = [];

  constructor() { }

  ngAfterViewInit(): void {
    for (let i = 0; i < this.snippets.length - 1; i++) {
      this.selectedAnswers.push('0');
    }
    this.changeAnswer.emit(this.selectedAnswers);
  }

  ngOnInit() {
    let rightAnswer = '';
    for (let i = 0; i < this.rightAnswers.length; i++) {
      rightAnswer += (this.answerOptions.indexOf(this.rightAnswers[i]) + 1).toString() + (i < this.rightAnswers.length - 1 ? '###' : '');
    }
    this.setRightAnswer.emit(rightAnswer);
  }

  public selectChange(event: any): void {
    const value = this.answerOptions.indexOf(event.detail.value);
    const index = event.target.id;
    this.selectedAnswers[index] = (value + 1).toString();
    this.changeAnswer.emit(this.selectedAnswers);
  }

}
