import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MoodleService } from 'src/services/moodle/moodle.service';
import { QuestionParserService } from 'src/services/parser/question-parser.service';

@Component({
  selector: 'app-course-detail',
  templateUrl: './course-detail.page.html',
  styleUrls: ['./course-detail.page.scss'],
})
export class CourseDetailPage implements OnInit {
  @ViewChild('questions') questions: ElementRef;

  public courseInfo = {};
  public courseContent = {};
  public quizzes = new Map();

  constructor(
    private route: ActivatedRoute,
    private moodleService: MoodleService,
    private parserService: QuestionParserService
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    const courseId = this.route.snapshot.paramMap.get('id');

    this.moodleService.getCourseById(courseId).subscribe(info => {
      this.courseInfo = info[0];
    });

    this.moodleService.getCourseContent(courseId).subscribe(content => {
      this.courseContent = content[0];
    });

    this.getQuizzes(courseId);
  }

  private getQuizzes(courseId: string) {
    this.moodleService.getQuizzesFromCourse(courseId).subscribe(response => {
      const quizzes = response.quizzes;
      for (const quiz of quizzes) {
        const elem: Quiz = {
          title: quiz.name,
          description: quiz.intro,
          hasQuestions: quiz.hasquestions
        };
        this.quizzes.set(quiz.id, elem);
      }
    });
  }

  private getQuestions(quizId: number) {
    this.moodleService.startAttemptForQuiz(quizId).subscribe(response => {
      const attempt = response.attempt;
      const attemptId = attempt.id;

      this.moodleService.finishAttemptForQuiz(attempt.id).subscribe(r => {
        this.moodleService.getFinishedQuizInfo(attemptId).subscribe(re => {
          const questions = re.questions;
          for (const question of questions) {
            this.questions.nativeElement.innerHTML += question.html;
          }
          const field = this.parserService.getRightAnswer();
          console.log(field);
        });
      });
    });
  }
}

interface Quiz {
  title: string;
  description: string;
  hasQuestions?: number;
}
