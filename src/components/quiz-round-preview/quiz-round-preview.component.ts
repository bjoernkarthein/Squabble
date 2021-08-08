import { Component, Input, OnInit } from '@angular/core';
import { MultiPlayerQuestion } from 'src/services/backend/backend.service';

@Component({
  selector: 'app-quiz-round-preview',
  templateUrl: './quiz-round-preview.component.html',
  styleUrls: ['./quiz-round-preview.component.scss'],
})
export class QuizRoundPreviewComponent implements OnInit {

  @Input() public player: number;
  @Input() public isFinished: boolean;
  @Input() public questions: MultiPlayerQuestion[];

  constructor() { }

  ngOnInit() {
  }

  public isRight(question: MultiPlayerQuestion): boolean {
    if (this.player === 1) {
      return question.playerOneRight;
    } else {
      return question.playerTwoRight;
    }
  }

}
