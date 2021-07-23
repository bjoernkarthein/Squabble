import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-true-false-question',
  templateUrl: './true-false-question.component.html',
  styleUrls: ['./true-false-question.component.scss'],
})
export class TrueFalseQuestionComponent implements OnInit {

  @Input() public text: string;
  @Input() public questionNumber: number;

  constructor() { }

  ngOnInit() { }

}
