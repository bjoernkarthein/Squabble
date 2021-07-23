import { Component, Input, OnInit } from '@angular/core';

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

  constructor() { }

  ngOnInit() { }

}
