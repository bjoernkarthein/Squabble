import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-gap-select-question',
  templateUrl: './gap-select-question.component.html',
  styleUrls: ['./gap-select-question.component.scss'],
})
export class GapSelectQuestionComponent implements OnInit {
  @Input() public questionNumber: number;
  @Input() public snippets: string[];
  @Input() public answerOptions: string[];
  @Output() public changeAnswer = new EventEmitter<string[]>();

  private selectedAnswers: string[] = [];

  constructor() { }

  ngOnInit() {
    for (let i = 0; i < this.snippets.length - 1; i++) {
      this.selectedAnswers.push('0');
    }
  }

  public selectChange(event: any): void {
    const value = this.answerOptions.indexOf(event.detail.value);
    const index = event.target.id;
    this.selectedAnswers[index] = (value + 1).toString();
    this.changeAnswer.emit(this.selectedAnswers);
  }

}
