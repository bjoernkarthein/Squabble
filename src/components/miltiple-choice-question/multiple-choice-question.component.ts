import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-multiple-choice-question',
  templateUrl: './multiple-choice-question.component.html',
  styleUrls: ['./multiple-choice-question.component.scss'],
})
export class MultipleChoiceQuestionComponent implements OnInit {

  @Input() public text: string;
  @Input() public questionNumber: number;
  @Input() public multipleAllowed: boolean;
  @Input() public answerOptions: any[];
  @Output() public changeAnswer = new EventEmitter<string[]>();

  constructor() {
  }

  ngOnInit(): void {
  }

  public radioGroupChange(event: any) {
    const selected = event.detail.value;
    for (let i = 0; i < this.answerOptions.length; i++) {
      if (this.answerOptions[i].text === selected) {
        this.changeAnswer.emit([i.toString()]);
      }
    }
  }

  public selectChange(option: any) {
    const checkedAnswers = [];
    for (const item of this.answerOptions) {
      if (option.text === item.text) {
        item.isChecked = !item.isChecked;
      }
      if (item.isChecked) {
        checkedAnswers.push('1');
      } else {
        checkedAnswers.push('0');
      }
    }
    console.log(checkedAnswers);
    this.changeAnswer.emit(checkedAnswers);
  }

}
