import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-short-answer-question',
  templateUrl: './short-answer-question.component.html',
  styleUrls: ['./short-answer-question.component.scss'],
})
export class ShortAnswerQuestionComponent implements OnInit {

  @Input() public text: string;
  @Input() public questionNumber: number;

  constructor() { }

  ngOnInit() { }

}
