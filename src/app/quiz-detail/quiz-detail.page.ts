import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BackendService } from 'src/services/backend/backend.service';
import { MoodleService } from 'src/services/moodle/moodle.service';
import { QuestionParserService, MoodleQuestionType } from 'src/services/parser/question-parser.service';

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

  constructor(private moodleService: MoodleService,
    private route: ActivatedRoute,
    private questionParser: QuestionParserService,
    private backendService: BackendService) { }

  ngOnInit() {
    this.questions.clear();
  }

  ionViewWillEnter() {
    this.quizId = this.route.snapshot.paramMap.get('qid');

    this.getQuizzeQuestions(this.quizId);
  }

  public getQText(input: string): string[] {
    return input.split('##BLANK##');
  }

  private async getQuizzeQuestions(id: string) {
    const res = await this.getAttemptId(id);
    console.log(res);

    this.moodleService.getQuizInProgressInformation(res).subscribe(re => {
      const questions = re.questions;
      for (const question of questions) {
        this.handleQuestion(question);
      }
    });

    //TODO: remove and add current attempt in progress id to database
    await this.moodleService.finishAttemptForQuiz(res);
  }

  private async getAttemptId(quizId: string) {
    // const res = await this.backendService.getAttempt(quizId);
    // console.log(res);
    // if (res[0]) {
    //   return res[0].attemptid;
    // }

    const createdAttempt = await this.moodleService.startAttemptForQuiz(quizId);
    // console.log(createdAttempt);
    // await this.backendService.createAttempt(quizId, createdAttempt.attempt.id);
    // await this.moodleService.finishAttemptForQuiz(createdAttempt.attempt.id);
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
