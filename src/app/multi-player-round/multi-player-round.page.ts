import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BackendService, MultiPlayerQuestion } from 'src/services/backend/backend.service';
import { MoodleService } from 'src/services/moodle/moodle.service';
import { MoodleQuestionType, QuestionParserService } from 'src/services/parser/question-parser.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-multi-player-round',
  templateUrl: './multi-player-round.page.html',
  styleUrls: ['./multi-player-round.page.scss'],
})
export class MultiPlayerRoundPage implements OnInit {
  @ViewChild('hiddenQuestions') hiddenQuestionDOM: ElementRef;

  public roundId: string;
  public currentGame;
  public questions: MoodleQuestionType[] = [];
  public parsedQuestions = [];
  public currentQuestion;
  public questionNumber = 1;
  private attemptId: number;
  private playerIds: number[] = [];

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private backendService: BackendService,
    private moodleService: MoodleService,
    private questionParser: QuestionParserService
  ) { }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    this.roundId = this.route.snapshot.paramMap.get('rid');
    const attemptId = this.route.snapshot.paramMap.get('gid');
    this.currentGame = await this.backendService.getMultiPlayerAttemptById(attemptId);
    this.currentGame.gameId = attemptId;

    this.playerIds = [
      this.currentGame.initiatorId,
      this.currentGame.opponentId,
      this.currentGame.opponentId,
      this.currentGame.initiatorId,
      this.currentGame.initiatorId,
      this.currentGame.opponentId
    ];
    console.log(this.playerIds);
    //console.log(this.currentGame);

    await this.getQuestionsForCurrentRound();
    console.log(this.questions);
  }

  public async getQuestionsForCurrentRound(): Promise<void> {
    this.questions = [];
    if (this.currentGame.questionsAreSet === 1) {
      //console.log("Found Questions");
      const res = await this.backendService.getMultiPlayerQuestions(this.currentGame.gameId, this.currentGame.currentRound);
      for (const elem of res) {
        //console.log(elem);
        const question = JSON.parse(elem.question);
        //console.log(question);
        this.questions.push(question);
        this.handleQuestion(question, elem.attemptId);
      }
      return;
    }

    for (let i = 0; i < 3; i++) {
      const data = await this.moodleService.getRandomQuizQuestion(this.currentGame.courseId);
      const question = data.question;
      this.attemptId = data.attemptId;
      this.questions.push(question);
      if (this.currentGame.questionsAreSet === 0) {
        //console.log("Question saved");
        this.saveQuestion(question);
      }
      this.handleQuestion(question, this.attemptId);
    }
  }

  public getQText(input: string): string[] {
    return input.split('##BLANK##');
  }

  public handleNextQuestion(): void {
    this.questionNumber++;
    const nextQuestion = this.parsedQuestions[this.questionNumber - 1];
    if (nextQuestion) {
      this.currentQuestion = nextQuestion;
    } else {
      this.location.back();
      if (this.currentGame.questionsAreSet === 0) {
        this.currentGame.currentRound++;
        if (this.currentGame.turns > 5) {
          this.currentGame.inprogress = false;
          console.log('here');
        }
      }
      this.currentGame.questionsAreSet = (this.currentGame.questionsAreSet + 1) % 2;
      this.currentGame.turns++;
      this.currentGame.nextTurnId = this.playerIds[this.currentGame.turns];
      this.backendService.updateMultiPlayerAttempt(this.currentGame);
      this.hiddenQuestionDOM.nativeElement.innerHTML = '';
    }
  }

  private async handleQuestion(question: any, attemptId: number) {
    this.hiddenQuestionDOM.nativeElement.innerHTML += question.html;
    const elem: MoodleQuestionType = {
      type: question.type,
      html: question.html,
      blockedByPrevious: question.blockedbyprevious,
      slot: question.slot
    };

    console.log('trying to parse question');
    console.log(elem);
    console.log('with attemptId');
    console.log(attemptId);
    const parsedQuestion = this.questionParser.parseQuestion(elem, attemptId);
    //console.log(parsedQuestion);
    this.parsedQuestions.push(parsedQuestion);
    //console.log(this.parsedQuestions);
    this.currentQuestion = this.parsedQuestions[this.questionNumber - 1];
  }

  private saveQuestion(moodleQue: MoodleQuestionType): void {
    const multiQuestion: MultiPlayerQuestion = {
      gameId: this.currentGame.gameId,
      roundNumber: this.currentGame.currentRound + 1,
      question: moodleQue,
      attemptId: this.attemptId
    };
    //console.log(multiQuestion);
    this.backendService.saveMultiPlayerQuestion(multiQuestion);
  }

}
