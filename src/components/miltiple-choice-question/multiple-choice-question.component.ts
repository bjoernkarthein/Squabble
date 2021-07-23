import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-multiple-choice-question',
  templateUrl: './multiple-choice-question.component.html',
  styleUrls: ['./multiple-choice-question.component.scss'],
})
export class MultipleChoiceQuestionComponent implements OnInit {

  @Input() public text: string;
  @Input() public questionNumber: number;
  @Input() public multipleAllowed: boolean;
  @Input() public answerOptions: string[];
  public selected: boolean[] = [];

  constructor() {
  }

  ngOnInit() {
    for (let i = 0; i < this.answerOptions.length; i++) {
      this.selected[i] = false;
    }
  }

}
