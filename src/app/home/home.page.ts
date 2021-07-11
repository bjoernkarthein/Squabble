import { AfterViewInit, Component, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/services/auth/auth.service';
import { BackendService } from 'src/services/backend/backend.service';
import { MoodleService } from 'src/services/moodle/moodle.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage {
  @ViewChild('questions') questions: ElementRef;

  public courseName: string;
  public courseUrl: string;
  public course;

  constructor(
    private moodleService: MoodleService,
    private authService: AuthService,
    private router: Router
  ) {
    this.getMoodleSiteInfo();
    this.moodleService.getCourses().subscribe(courses => {
      this.course = courses[1];
      this.courseName = this.course.fullname;
      console.log(this.course);
      this.getQuizzes(this.course.id);
    });
  }

  public async logout() {
    await this.authService.logout();
    this.router.navigateByUrl('/', { replaceUrl: true });
  }

  private getMoodleSiteInfo() {
    this.moodleService.getSiteInfo().subscribe(info => {
      console.log(info);
      this.courseUrl = info.siteurl;
    });
  }

  private getCourse() {
    this.moodleService.getCourses().subscribe(courses => {
      this.course = courses[0];
      console.log(this.course);
    });
  }

  private getQuizzes(courseId: number) {
    this.moodleService.getQuizzesFromCourse(courseId).subscribe(response => {
      console.log(response);
      const quizzes = response.quizzes;
      for (const quiz of quizzes) {
        console.log(quiz.id);
        this.getQuestions(quiz.id);
      }
    });
  }

  private getQuestions(quizId: number) {
    this.moodleService.startAttemptForQuiz(quizId).subscribe(response => {
      console.log(response);
      const attempt = response.attempt;
      const attemptId = attempt.id;

      this.moodleService.finishAttemptForQuiz(attempt.id).subscribe(r => {
        console.log(r);
        this.moodleService.getFinishedQuizInfo(attemptId).subscribe(re => {
          console.log(re);
          const questions = re.questions;
          for (const question of questions) {
            this.questions.nativeElement.innerHTML += question.html;
          }
        });
      });
    });
  }

}
