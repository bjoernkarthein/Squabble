import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-numeric-question',
  templateUrl: './numeric-question.component.html',
  styleUrls: ['./numeric-question.component.scss'],
})
export class NumericQuestionComponent implements OnInit {

  @Input() public text: string;
  @Input() public questionNumber: number;

  constructor() { }

  ngOnInit() { }

}
