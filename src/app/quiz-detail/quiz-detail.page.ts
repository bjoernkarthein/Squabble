import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/services/auth/auth.service';
import { BackendService, SinglePlayerAttempt, User } from 'src/services/backend/backend.service';
import { MoodleService } from 'src/services/moodle/moodle.service';
import { QuestionParserService, MoodleQuestionType, Field } from 'src/services/parser/question-parser.service';
import { Storage } from '@capacitor/storage';
import { ToastController } from '@ionic/angular';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-quiz-detail',
  templateUrl: './quiz-detail.page.html',
  styleUrls: ['./quiz-detail.page.scss'],
  providers: [DatePipe]
})
export class QuizDetailPage implements OnInit {
  @ViewChild('hiddenQuestions') hiddenQuestionDOM: ElementRef;

  public quizId: string;
  public quizTitle: string;
  public questions = new Map();
  private currentUser: User;
  private givenAnswers = new Map<string, Field[]>();

  constructor(
    private moodleService: MoodleService,
    private backendService: BackendService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private questionParser: QuestionParserService,
    private toastController: ToastController,
    private datePipe: DatePipe
  ) {
  }

  async ngOnInit() {
    this.questions.clear();
    this.currentUser = await this.authService.getCurrentUser();

  }

  ionViewWillEnter() {
    this.quizId = this.route.snapshot.paramMap.get('qid');

    this.getQuizQuestions(this.quizId);
  }

  public async submitAttempt(): Promise<void> {
    const attempt = await this.getAttemptId(this.quizId);
    const res = await this.moodleService.processQuizAttempt(attempt, this.currentUser.token, this.givenAnswers, 1);
    await Storage.remove({ key: 'inProgressAttempt' + this.quizId });
    this.givenAnswers.clear();

    if (res.errorcode) {

      this.showToast('An error occured while saving', 'danger');
      return;
    }
    this.showToast('Attempt submitted successfully', 'success');
  }

  public getQText(input: string): string[] {
    return input.split('##BLANK##');
  }

  public addAnswer(input: string[], questionId: number): void {
    const question = this.questions.get(questionId);
    const answers = question.answerFields;
    const sCheck = question.sequenceCheck;

    const data: Field[] = [];
    data.push(sCheck);
    for (let i = 0; i < input.length; i++) {
      if (!input[i] || input[i] === '') { return; }
      answers[i].value = input[i];
      data.push(answers[i]);
    }
    this.givenAnswers.set(sCheck.name, data);

  }

  private async getQuizQuestions(id: string): Promise<void> {
    const attempt = await this.getAttemptId(id);

    this.moodleService.getQuizInProgressInformation(attempt, this.currentUser.token).subscribe(re => {
      const questions = re.questions;
      for (const question of questions) {
        this.handleQuestion(question);
      }
    });

    const date = new Date();
    const formattedDate = this.datePipe.transform(date, 'yyyy-MM-dd HH:mm:ss', 'UTC+2');

    const singleAttempt: SinglePlayerAttempt = {
      attemptId: attempt,
      userId: this.currentUser.id,
      usename: this.currentUser.username,
      quizId: id,
      quizname: this.quizTitle,
      startDate: formattedDate
    };

    await this.backendService.saveSinglePlayerAttempt(singleAttempt);
  }

  private async getAttemptId(quizId: string) {
    const attemptInProgress = await Storage.get({ key: 'inProgressAttempt' + quizId });
    if (attemptInProgress.value) {
      return attemptInProgress.value;
    }

    const createdAttempt = await this.moodleService.startAttemptForQuiz(quizId, this.currentUser.token);
    if (createdAttempt.errorcode) {
      this.showToast('Failed to start quiz attempt (' + createdAttempt.errorcode + ')', 'danger');
      return;
    }
    await Storage.set({ key: 'inProgressAttempt' + quizId, value: createdAttempt.attempt.id });
    return createdAttempt.attempt.id;
  }

  private async handleQuestion(question: any): Promise<void> {
    this.hiddenQuestionDOM.nativeElement.innerHTML += question.html;
    const elem: MoodleQuestionType = {
      type: question.type,
      html: question.html,
      blockedByPrevious: question.blockedbyprevious,
      slot: question.slot
    };
    const attempt = await this.getAttemptId(this.quizId);
    const parsedQuestion = this.questionParser.parseQuestion(elem, attempt, true);

    this.questions.set(parsedQuestion.id, parsedQuestion);
  }

  /**
  * present a message toast
  *
  * @param msg Message to be displayed
  * @param clr color of the Toast
  */
  private async showToast(msg: string, clr: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 3000,
      animated: true,
      color: clr
    });
    toast.present();
  }
}
