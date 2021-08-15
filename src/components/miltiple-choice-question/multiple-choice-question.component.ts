import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-multiple-choice-question',
  templateUrl: './multiple-choice-question.component.html',
  styleUrls: ['./multiple-choice-question.component.scss'],
})
export class MultipleChoiceQuestionComponent implements OnInit, AfterViewInit {

  @Input() public text: string;
  @Input() public questionNumber: number;
  @Input() public multipleAllowed: boolean;
  @Input() public answerOptions: any[];
  @Input() public rightAnswers: string[] = [];

  @Output() public setRightAnswer = new EventEmitter<string>();
  @Output() public changeAnswer = new EventEmitter<string[]>();

  constructor() {
  }

  ngAfterViewInit(): void {
    const initialValues: string[] = [];
    for (const option of this.answerOptions) {
      initialValues.push('-1');
    }
    this.changeAnswer.emit(initialValues);
  }

  ngOnInit(): void {
    let rightAnswer = '';

    if (!this.multipleAllowed) {
      for (let j = 0; j < this.answerOptions.length; j++) {
        if (this.returnChoppedString(this.answerOptions[j].text) === this.rightAnswers[0]) {
          this.setRightAnswer.emit((j).toString());
        }
      }
      return;
    }

    for (let i = 0; i < this.answerOptions.length; i++) {
      let includes = false;
      for (const rightA of this.rightAnswers) {
        if (this.returnChoppedString(this.answerOptions[i].text) === rightA) {
          includes = true;
        }
      }

      if (includes) {
        rightAnswer += '1' + (i < this.answerOptions.length - 1 ? '###' : '');
      } else {
        rightAnswer += '0' + (i < this.answerOptions.length - 1 ? '###' : '');
      }
    }
    this.setRightAnswer.emit(rightAnswer);
  }

  public radioGroupChange(event: any) {
    const selected = event.detail.value;
    for (let i = 0; i < this.answerOptions.length; i++) {
      if (this.answerOptions[i].text === selected) {
        this.changeAnswer.emit([(i).toString()]);
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

    this.changeAnswer.emit(checkedAnswers);
  }

  private returnChoppedString(input: string): string {
    const regEx = new RegExp('\^\\S+\\s');
    let newString = input.replace(regEx, '');
    newString = newString.substring(0, newString.length - 1);

    return newString;
  }

}
