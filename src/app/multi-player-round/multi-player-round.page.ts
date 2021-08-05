import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BackendService, MultiPlayerAnswer, MultiPlayerQuestion } from 'src/services/backend/backend.service';
import { MoodleService } from 'src/services/moodle/moodle.service';
import { Field, MoodleQuestionType, QuestionParserService } from 'src/services/parser/question-parser.service';
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
  public currentAnswer: Map<number, MultiPlayerAnswer[]> = new Map();
  public questionNumber = 1;
  public rightAnswer: string;

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

    await this.getQuestionsForCurrentRound();
  }

  public async getQuestionsForCurrentRound(): Promise<void> {
    this.questions = [];
    if (this.currentGame.questionsAreSet === 1) {
      const res = await this.backendService.getMultiPlayerQuestions(this.currentGame.gameId, this.currentGame.currentRound);
      for (const elem of res) {
        const question = JSON.parse(elem.question);
        this.questions.push(question);
        this.handleQuestion(question, elem.attemptId);
      }
      return;
    }

    const data = await this.moodleService.getRandomQuizQuestion(this.currentGame.courseId, 3);
    console.log(data);
    let slot = 1;
    for (const elem of data) {
      const question = elem.question;
      this.attemptId = elem.attemptId;
      this.questions.push(question);
      if (this.currentGame.questionsAreSet === 0) {
        this.saveQuestion(question, slot);
      }
      this.handleQuestion(question, this.attemptId);
      slot++;
      console.log(this.parsedQuestions);
    }
  }

  public getQText(input: string): string[] {
    return input.split('##BLANK##');
  }

  public handleNextQuestion(): void {
    this.backendService.saveMultiPlayerAnswer(this.currentAnswer.get(this.questionNumber));
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

  public setRightAnswer(input: string) {
    this.rightAnswer = input;
    console.log(this.rightAnswer);
  }

  public saveAnswer(input: string[]) {
    const question = this.currentQuestion;
    const answers = question.answerFields;
    const givenAnswers = new Array(input.length);

    for (let i = 0; i < input.length; i++) {
      console.log(givenAnswers);

      if (!input[i] || input[i] === '') { return; }
      answers[i].value = input[i];

      const multiAnswer: MultiPlayerAnswer = {
        gameId: this.currentGame.gameId,
        attemptId: this.attemptId,
        roundNumber: this.currentGame.currentRound + 1,
        questionSlot: this.questionNumber,
        answerOption: answers[i].name,
        answerValue: answers[i].value,
      };
      console.log(i);
      console.log(multiAnswer);
      givenAnswers[i] = multiAnswer;
      console.log(givenAnswers);
      this.currentAnswer.set(multiAnswer.questionSlot, givenAnswers);
    }

    console.log(this.currentAnswer);
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
    const parsedQuestion = this.questionParser.parseQuestion(elem, attemptId, false);
    this.parsedQuestions.push(parsedQuestion);
    this.currentQuestion = this.parsedQuestions[this.questionNumber - 1];
  }

  private saveQuestion(moodleQue: MoodleQuestionType, slot: number): void {
    const multiQuestion: MultiPlayerQuestion = {
      gameId: this.currentGame.gameId,
      attemptId: this.attemptId,
      roundNumber: this.currentGame.currentRound + 1,
      questionSlot: slot,
      question: moodleQue,
      rightAnswers: this.rightAnswer
    };
    this.backendService.saveMultiPlayerQuestion(multiQuestion);
  }
}
