import { AfterViewInit, Component, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/services/auth/auth.service';
import { BackendService, User } from 'src/services/backend/backend.service';
import { MoodleService } from 'src/services/moodle/moodle.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage {
  @ViewChild('questions') questions: ElementRef;

  public courseName: string;
  public moodleUrl: string;
  public courses = new Map();
  public currentUser: User = { id: -1 };

  constructor(
    private moodleService: MoodleService,
    private authService: AuthService,
    private router: Router
  ) {
    this.getMoodleSiteInfo();
    this.getCourses();
  }

  public async logout() {
    await this.authService.logout();
    this.router.navigateByUrl('/', { replaceUrl: true });
  }

  public getUrl(courseId: string, disabled: boolean): string {
    if(disabled) {
      return null;
    } else {
      return '/mycourses/' + courseId;
    }
  }

  public hasQuizzes(courseId: number): boolean {
    const course = this.courses.get(courseId);
    return course.quizCount > 0;
  }

  private getMoodleSiteInfo() {
    this.moodleService.getSiteInfo().subscribe(info => {
      this.moodleUrl = info.siteurl;
    });
  }

  private getCourses() {
    this.moodleService.getCoursesForUser(4).subscribe(courses => {
      for(const course of courses) {
        const elem: Course = {
          title: course.displayname,
          description: course.summary,
        };
        this.moodleService.getQuizzesFromCourse(course.id).subscribe(res => {
          const quizzes = res.quizzes;
          elem.quizCount = quizzes.length;
          this.courses.set(course.id, elem);
        });
      }
    });
  }

  // private getCourse() {
  //   this.moodleService.getCourses().subscribe(courses => {
  //     this.course = courses[0];
  //   });
  // }

  // private getQuizzes(courseId: number) {
  //   this.moodleService.getQuizzesFromCourse(courseId).subscribe(response => {
  //     const quizzes = response.quizzes;
  //     for (const quiz of quizzes) {
  //       this.getQuestions(quiz.id);
  //     }
  //   });
  // }

  // private getQuestions(quizId: number) {
  //   this.moodleService.startAttemptForQuiz(quizId).subscribe(response => {
  //     const attempt = response.attempt;
  //     const attemptId = attempt.id;

  //     this.moodleService.finishAttemptForQuiz(attempt.id).subscribe(r => {
  //       this.moodleService.getFinishedQuizInfo(attemptId).subscribe(re => {
  //         const questions = re.questions;
  //         for (const question of questions) {
  //           this.questions.nativeElement.innerHTML += question.html;
  //         }
  //       });
  //     });
  //   });
  // }

}

interface Course {
  title: string;
  description: string;
  quizCount?: number;
}
