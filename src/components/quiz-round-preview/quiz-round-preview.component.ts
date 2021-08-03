import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-quiz-round-preview',
  templateUrl: './quiz-round-preview.component.html',
  styleUrls: ['./quiz-round-preview.component.scss'],
})
export class QuizRoundPreviewComponent implements OnInit {

  public isFinished = true;
  public questions = [
    { right: true },
    { right: true },
    { right: false },
  ];

  constructor() { }

  ngOnInit() { }

}
