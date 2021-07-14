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
  public quizzes;

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
      this.quizzes = response.quizzes;
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
