import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BackendService, MultiPlayerAnswer, MultiPlayerQuestion, User } from 'src/services/backend/backend.service';
import { MoodleService } from 'src/services/moodle/moodle.service';
import { MoodleQuestionType, QuestionParserService } from 'src/services/parser/question-parser.service';
import { Location } from '@angular/common';
import { AuthService } from 'src/services/auth/auth.service';
import { Storage } from '@capacitor/storage';

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
  private existsCurrentQuestion: boolean;

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
      this.currentGame.opponentId,
      -1
    ];

    await this.checkForCurrentQuestion();

    if (!this.existsCurrentQuestion) {
      await this.getQuestionsForCurrentRound();
    }
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
      await Storage.set({
        key: 'multiplayerQuestions',
        value: JSON.stringify({ mpq: this.multiPlayerQuestions })
      });
      return;
    }

    const data = await this.moodleService.getRandomQuizQuestion(this.currentGame.courseId, 3);

    for (const elem of data) {
      const question = elem.question;
      this.attemptId = elem.attemptId;
      this.questions.push(question);
      this.attemptIds.push(this.attemptId);
      this.handleQuestion(question, this.attemptId);
    }

    await Storage.set({
      key: 'currentQuestions',
      value: JSON.stringify({ moodleQuestions: this.questions, parsedQuestions: this.parsedQuestions, attemptIds: this.attemptIds })
    });

    await Storage.set({
      key: 'currentQuestionNumber',
      value: this.questionNumber.toString()
    });
    console.log('currentQuestions', this.parsedQuestions);
  }

  public getQText(input: string): string[] {
    return input.split('##BLANK##');
  }

  public async handleNextQuestion(): Promise<void> {
    this.updateGame();
    console.log('MultiPlayerQuestions', this.multiPlayerQuestions);
    const nextQuestion = this.parsedQuestions[this.questionNumber];
    console.log(nextQuestion);
    if (nextQuestion) {
      this.currentQuestion = nextQuestion;
    } else {
      this.finishRound();
      await Storage.remove({ key: 'currentQuestions' });
      await Storage.remove({ key: 'currentQuestionNumber' });
      await Storage.remove({ key: 'currentQuestions' });
      await Storage.remove({ key: 'multiplayerQuestions' });
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
      if (!input[i] || input[i] === '') { return; }
      answers[i].value = input[i];

      const multiAnswer: MultiPlayerAnswer = {
        gameId: this.currentGame.gameId,
        roundNumber: this.currentGame.currentRound + 1,
        questionSlot: this.questionNumber,
        answerOption: answers[i].name,
        answerValue: answers[i].value,
      };
      givenAnswers[i] = multiAnswer;
      this.currentAnswer.set(multiAnswer.questionSlot, givenAnswers);
    }
    console.log(givenAnswers);
  }

  private async checkForCurrentQuestion(): Promise<void> {
    const ret = await Storage.get({ key: 'currentQuestions' });
    if (!ret.value) {
      this.existsCurrentQuestion = false;
      return;
    }

    const res = await Storage.get({ key: 'currentQuestionNumber' });

    const resp = await Storage.get({ key: 'multiplayerQuestions' });

    if (resp.value) {
      const multiplayerQuestions = JSON.parse(resp.value).mpq;
      this.multiPlayerQuestions = multiplayerQuestions;
      console.log(multiplayerQuestions);
    }

    const currentQuestionNumber = Number(res.value);
    const currentQuestions = JSON.parse(ret.value);
    const currentQuestion = currentQuestions.parsedQuestions[Number(currentQuestionNumber) - 1];
    this.parsedQuestions = currentQuestions.parsedQuestions;
    this.questions = currentQuestions.moodleQuestions;
    this.attemptIds = currentQuestions.attemptIds;
    this.questionNumber = currentQuestionNumber;
    console.log(currentQuestion);
    this.existsCurrentQuestion = true;
    this.currentQuestion = currentQuestion;
  }

  private async handleQuestion(question: any, attemptId: number) {
    this.hiddenQuestionDOM.nativeElement.innerHTML += question.html;
    const elem: MoodleQuestionType = {
      type: question.type,
      html: question.html,
      blockedByPrevious: question.blockedbyprevious,
      slot: question.slot
    };

    const parsedQuestion = this.questionParser.parseQuestion(elem, attemptId, false);
    this.parsedQuestions.push(parsedQuestion);
    this.currentQuestion = this.parsedQuestions[this.questionNumber - 1];
    console.log(this.parsedQuestions);
  }

  private async saveQuestion(moodleQue: MoodleQuestionType, slot: number): Promise<void> {
    const multiQuestion: MultiPlayerQuestion = {
      gameId: this.currentGame.gameId,
      attemptId: this.attemptIds[slot - 1],
      roundNumber: this.currentGame.currentRound + 1,
      questionSlot: slot,
      question: moodleQue,
      rightAnswers: this.rightAnswer
    };

    this.multiPlayerQuestions.push(multiQuestion);
    await Storage.set({
      key: 'multiplayerQuestions',
      value: JSON.stringify({ mpq: this.multiPlayerQuestions })
    });
    this.backendService.saveMultiPlayerQuestion(multiQuestion);
  }

  private async checkQuestionAnswer(questionSlot: number, rightAnswer: string) {
    const givenAnswer = this.currentAnswer.get(questionSlot);

    let answeredRight = true;
    const rightAnswerValues = rightAnswer.split('###');

    for (let i = 0; i < rightAnswerValues.length; i++) {
      if (rightAnswerValues[i] !== givenAnswer[i].answerValue) {
        answeredRight = false;
      }
    }

    const mpq = this.multiPlayerQuestions[questionSlot - 1];

    if (this.currentGame.initiatorId === this.currentUser.id) {
      mpq.playerOneRight = answeredRight;
    } else if (this.currentGame.opponentId === this.currentUser.id) {
      mpq.playerTwoRight = answeredRight;
    }
    await this.backendService.updateMultiPlayerQuestion(mpq);
  }

  private async updateGame(): Promise<void> {
    if (this.currentGame.questionsAreSet === 0) {
      await this.saveQuestion(this.questions[this.questionNumber - 1], this.questionNumber);
    }

    this.backendService.saveMultiPlayerAnswer(this.currentAnswer.get(this.questionNumber));
    this.checkQuestionAnswer(this.questionNumber, this.rightAnswer);
    this.questionNumber++;

    await Storage.set({
      key: 'currentQuestionNumber',
      value: this.questionNumber.toString()
    });
  }

  private async finishRound(): Promise<void> {
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

        playerOneRight += !!question.playerOneRight ? 1 : 0;
        playerTwoRight += !!question.playerTwoRight ? 1 : 0;
      }
      this.updateGameScore(playerOneRight, playerTwoRight);
    }

    this.currentGame.nextTurnId = this.playerIds[this.currentGame.turns];
    if (this.currentGame.nextTurnId === -1) {
      this.currentGame.inprogress = false;
    }
    this.hiddenQuestionDOM.nativeElement.innerHTML = '';
    await this.backendService.updateMultiPlayerAttempt(this.currentGame);
    console.log(this.currentGame);
  }

  private updateGameScore(oneRight: number, twoRight: number) {
    if (oneRight > twoRight) {
      this.currentGame.initiatorPoints++;

    } else if (oneRight < twoRight) {
      this.currentGame.opponentPoints++;
    } else {
      this.currentGame.initiatorPoints++;
      this.currentGame.opponentPoints++;
    }
  }
}
