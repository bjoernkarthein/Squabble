import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/services/auth/auth.service';
import { BackendService, User } from 'src/services/backend/backend.service';
import { MoodleService } from 'src/services/moodle/moodle.service';
import { QuestionParserService, MoodleQuestionType } from 'src/services/parser/question-parser.service';
import { Storage } from '@capacitor/storage';

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

  constructor(private moodleService: MoodleService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private questionParser: QuestionParserService) {
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

  public async handleSaveClick(): Promise<void> {
    const attempt = await this.getAttemptId(this.quizId);
    await this.moodleService.processQuizAttempt(attempt, this.currentUser.token, [], 0);
  }

  public async handleSubmitClick(): Promise<void> {
    const attempt = await this.getAttemptId(this.quizId);
    await this.moodleService.processQuizAttempt(attempt, this.currentUser.token, [], 1).then(res => {
      console.log(res);
    });
    await Storage.remove({ key: 'inProgressAttempt' });
  }

  public getQText(input: string): string[] {
    return input.split('##BLANK##');
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
