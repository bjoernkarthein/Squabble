import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MoodleService } from 'src/services/moodle/moodle.service';

@Component({
  selector: 'app-course-detail',
  templateUrl: './course-detail.page.html',
  styleUrls: ['./course-detail.page.scss'],
})
export class CourseDetailPage implements OnInit {
  @ViewChild('questions') questions: ElementRef;

  public courseInfo = {};
  public courseContent = {};

  constructor(
    private route: ActivatedRoute,
    private moodleService: MoodleService
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
        this.getQuestions(quiz.id);
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
        });
      });
    });
  }

}
