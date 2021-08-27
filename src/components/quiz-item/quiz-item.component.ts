import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-quiz-item',
  templateUrl: './quiz-item.component.html',
  styleUrls: ['./quiz-item.component.scss'],
})
export class QuizItemComponent implements OnInit {

  @Input() quizName: string;
  @Input() type: string;
  @Input() disabled: boolean;

  constructor() { }

  ngOnInit() { }

}
