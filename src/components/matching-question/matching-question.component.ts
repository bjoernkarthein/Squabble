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
  @Output() public changeAnswer = new EventEmitter<string[]>();

  private selectedAnswers: string[] = [];

  constructor() { }

  ngOnInit() {
    for (const g of this.gapText) {
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
