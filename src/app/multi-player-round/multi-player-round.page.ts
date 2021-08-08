import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BackendService, MultiPlayerAnswer, MultiPlayerQuestion, User } from 'src/services/backend/backend.service';
import { MoodleService } from 'src/services/moodle/moodle.service';
import { Field, MoodleQuestionType, QuestionParserService } from 'src/services/parser/question-parser.service';
import { Location } from '@angular/common';
import { AuthService } from 'src/services/auth/auth.service';

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
  public currentUser: User;
  public multiPlayerQuestions: MultiPlayerQuestion[] = [];

  private attemptId: number;
  private attemptIds: number[] = [];
  private playerIds: number[] = [];

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private backendService: BackendService,
    private moodleService: MoodleService,
    private questionParser: QuestionParserService,
    private authService: AuthService
  ) { }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    this.roundId = this.route.snapshot.paramMap.get('rid');
    const attemptId = this.route.snapshot.paramMap.get('gid');
    this.currentGame = await this.backendService.getMultiPlayerAttemptById(attemptId);
    this.currentGame.gameId = attemptId;
    this.currentUser = await this.authService.getCurrentUser();

    this.playerIds = [
      this.currentGame.initiatorId,
      this.currentGame.opponentId,
      this.currentGame.opponentId,
      this.currentGame.initiatorId,
      this.currentGame.initiatorId,
      this.currentGame.opponentId
    ];
    console.log(this.currentGame);
    await this.getQuestionsForCurrentRound();
  }

  public async getQuestionsForCurrentRound(): Promise<void> {
    this.questions = [];
    if (this.currentGame.questionsAreSet === 1) {
      const res = await this.backendService.getMultiPlayerQuestions(this.currentGame.gameId, this.currentGame.currentRound);
      for (const elem of res) {
        this.multiPlayerQuestions.push(elem);
        const question = JSON.parse(elem.question);
        this.questions.push(question);
        this.handleQuestion(question, elem.attemptId);
      }
      return;
    }

    const data = await this.moodleService.getRandomQuizQuestion(this.currentGame.courseId, 3);
    console.log(data);
    for (const elem of data) {
      const question = elem.question;
      this.attemptId = elem.attemptId;
      this.questions.push(question);
      this.attemptIds.push(this.attemptId);
      this.handleQuestion(question, this.attemptId);
      console.log(this.parsedQuestions);
    }
  }

  public getQText(input: string): string[] {
    return input.split('##BLANK##');
  }

  public async handleNextQuestion(): Promise<void> {
    if (this.currentGame.questionsAreSet === 0) {
      console.log('Saved');
      this.saveQuestion(this.questions[this.questionNumber - 1], this.questionNumber);
    }

    this.backendService.saveMultiPlayerAnswer(this.currentAnswer.get(this.questionNumber));
    this.checkQuestionAnswer(this.questionNumber, this.rightAnswer);
    this.questionNumber++;
    const nextQuestion = this.parsedQuestions[this.questionNumber - 1];
    if (nextQuestion) {
      this.currentQuestion = nextQuestion;
    } else {
      this.location.back();
      if (this.currentGame.questionsAreSet === 0) {
        this.currentGame.currentRound++;
      }
      this.currentGame.questionsAreSet = (this.currentGame.questionsAreSet + 1) % 2;
      this.currentGame.turns++;

      if (this.currentGame.turns % 2 === 0) {
        let playerOneRight = 0;
        let playerTwoRight = 0;
        for (const question of this.multiPlayerQuestions) {
          console.log(question);
          playerOneRight += !!question.playerOneRight ? 1 : 0;
          playerTwoRight += !!question.playerTwoRight ? 1 : 0;
        }
        this.updateGameScore(playerOneRight, playerTwoRight);
      }

      this.currentGame.nextTurnId = this.playerIds[this.currentGame.turns];
      this.hiddenQuestionDOM.nativeElement.innerHTML = '';
      await this.backendService.updateMultiPlayerAttempt(this.currentGame);
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
    console.log('SAVING', this.rightAnswer);
    console.log('QUESTION', moodleQue);
    const multiQuestion: MultiPlayerQuestion = {
      gameId: this.currentGame.gameId,
      attemptId: this.attemptIds[slot - 1],
      roundNumber: this.currentGame.currentRound + 1,
      questionSlot: slot,
      question: moodleQue,
      rightAnswers: this.rightAnswer
    };
    this.multiPlayerQuestions.push(multiQuestion);
    this.backendService.saveMultiPlayerQuestion(multiQuestion);
  }

  private async checkQuestionAnswer(questionSlot: number, rightAnswer: string) {
    const givenAnswer = this.currentAnswer.get(questionSlot);
    console.log('Answer given', givenAnswer);
    let answeredRight = true;
    const rightAnswerValues = rightAnswer.split('###');
    console.log('right values', rightAnswerValues);
    for (let i = 0; i < rightAnswerValues.length; i++) {
      if (rightAnswerValues[i] !== givenAnswer[i].answerValue) {
        answeredRight = false;
      }
    }

    const mpq = this.multiPlayerQuestions[questionSlot - 1];
    console.log('Question to alter', mpq);
    console.log('value', answeredRight);

    if (this.currentGame.initiatorId === this.currentUser.id) {
      mpq.playerOneRight = answeredRight;
    } else if (this.currentGame.opponentId === this.currentUser.id) {
      mpq.playerTwoRight = answeredRight;
    }
    await this.backendService.updateMultiPlayerQuestion(mpq);
    console.log(answeredRight);
  }

  private updateGameScore(oneRight: number, twoRight: number) {
    console.log('Points', oneRight, twoRight);
    if (oneRight > twoRight) {
      this.currentGame.initiatorPoints++;
      console.log('InitiatorPoints', this.currentGame.initiatorPoints);
    } else if (oneRight < twoRight) {
      this.currentGame.opponentPoints++;
    } else {
      this.currentGame.initiatorPoints++;
      this.currentGame.opponentPoints++;
    }
  }
}
