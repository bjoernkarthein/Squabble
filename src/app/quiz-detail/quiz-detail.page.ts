import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/services/auth/auth.service';
import { BackendService, User } from 'src/services/backend/backend.service';
import { MoodleService } from 'src/services/moodle/moodle.service';
import { QuestionParserService, MoodleQuestionType, Field } from 'src/services/parser/question-parser.service';
import { Storage } from '@capacitor/storage';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-quiz-detail',
  templateUrl: './quiz-detail.page.html',
  styleUrls: ['./quiz-detail.page.scss'],
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
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private questionParser: QuestionParserService,
    private toastController: ToastController
  ) {
  }

  async ngOnInit() {
    this.questions.clear();
    this.currentUser = await this.authService.getCurrentUser();
    console.log(this.currentUser);
  }

  ionViewWillEnter() {
    this.quizId = this.route.snapshot.paramMap.get('qid');

    this.getQuizzeQuestions(this.quizId);
  }

  // public async handleSaveClick(): Promise<void> {
  //   const attempt = await this.getAttemptId(this.quizId);
  //   const res = await this.moodleService.processQuizAttempt(attempt, this.currentUser.token, this.givenAnswers, 0);
  //   if (res.errorcode) {
  //     console.log(res.errorcode);
  //     this.showToast('An error occured while saving', 'danger');
  //     return;
  //   }
  //   await this.getQuizzeQuestions(this.quizId);
  //   this.showToast('Attempt saved successfully', 'success');
  // }

  public async handleSubmitClick(): Promise<void> {
    const attempt = await this.getAttemptId(this.quizId);
    const res = await this.moodleService.processQuizAttempt(attempt, this.currentUser.token, this.givenAnswers, 1);
    await Storage.remove({ key: 'inProgressAttempt' });

    if (res.errorcode) {
      console.log(res.errorcode);
      this.showToast('An error occured while saving', 'danger');
      return;
    }
    this.showToast('Attempt submitted successfully', 'success');
  }

  public async showToast(msg: string, clr: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 3000,
      animated: true,
      color: clr
    });
    toast.present();
  }

  public getQText(input: string): string[] {
    return input.split('##BLANK##');
  }

  public addAnswer(input: string[], questionId: number) {
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
    console.log(this.givenAnswers);
  }

  private async getQuizzeQuestions(id: string) {
    const res = await this.getAttemptId(id);
    console.log(res);

    this.moodleService.getQuizInProgressInformation(res, this.currentUser.token).subscribe(re => {
      const questions = re.questions;
      for (const question of questions) {
        this.handleQuestion(question);
      }
    });
  }

  private async getAttemptId(quizId: string) {
    const attemptInProgress = await Storage.get({ key: 'inProgressAttempt' });
    if (attemptInProgress.value) {
      return attemptInProgress.value;
    }

    const createdAttempt = await this.moodleService.startAttemptForQuiz(quizId, this.currentUser.token);
    await Storage.set({ key: 'inProgressAttempt', value: createdAttempt.attempt.id });
    return createdAttempt.attempt.id;
  }

  private handleQuestion(question: any) {
    this.hiddenQuestionDOM.nativeElement.innerHTML += question.html;
    const elem: MoodleQuestionType = {
      type: question.type,
      html: question.html,
      blockedByPrevious: question.blockedbyprevious,
      slot: question.slot
    };

    const parsedQuestion = this.questionParser.parseQuestion(elem);
    console.log(parsedQuestion);
    this.questions.set(parsedQuestion.id, parsedQuestion);
  }
}
