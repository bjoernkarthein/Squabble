import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-general-question',
  templateUrl: './general-question.component.html',
  styleUrls: ['./general-question.component.scss'],
})
export class GeneralQuestionComponent implements OnInit {

  @Input() questionText: string;

  constructor() { }

  ngOnInit() {}

}
