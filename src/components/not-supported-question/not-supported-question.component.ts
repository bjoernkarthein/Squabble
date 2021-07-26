import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-not-supported-question',
  templateUrl: './not-supported-question.component.html',
  styleUrls: ['./not-supported-question.component.scss'],
})
export class NotSupportedQuestionComponent implements OnInit {

  @Input() public questionNumber: number;
  @Input() public text: string;

  constructor() { }

  ngOnInit() { }

}
