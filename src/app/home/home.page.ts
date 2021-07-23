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
  public moodleUrl: string;
  public courses = new Map();

  constructor(
    private moodleService: MoodleService,
    private authService: AuthService,
    private router: Router
  ) {
    this.getMoodleSiteInfo();
    this.getCourses();
    console.log(this.authService.currentUser);
  }

  public logout() {
    this.authService.logout();
    console.log(this.authService.currentUser);
    this.router.navigateByUrl('/', { replaceUrl: true });
  }

  public getUrl(courseId: string, disabled: boolean): string {
    if (disabled) {
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
      this.moodleUrl += '/my';
    });
  }

  private getCourses() {
    const id = this.authService.currentUser.id;
    this.moodleService.getCoursesForUser(id).subscribe(courses => {
      for (const course of courses) {
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

}

interface Course {
  title: string;
  description: string;
  quizCount?: number;
}
