import { AfterViewInit, Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/services/auth/auth.service';
import { BackendService, Course, User } from 'src/services/backend/backend.service';
import { MoodleService } from 'src/services/moodle/moodle.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage implements OnInit {
  public moodleUrl: string;
  public courses: Course[] = [];
  private currentUser: User;

  constructor(
    private moodleService: MoodleService,
    private authService: AuthService,
    private backendService: BackendService,
    private router: Router
  ) { }

  async ngOnInit(): Promise<void> {
    this.currentUser = await this.authService.getCurrentUser();

    this.getMoodleSiteInfo();
    this.getCourses();
  }

  public logout() {
    this.authService.logout();
    this.router.navigateByUrl('/', { replaceUrl: true });
  }

  public getUrl(courseId: number, disabled: boolean): string {
    if (disabled) {
      return null;
    } else {
      return '/mycourses/' + courseId;
    }
  }

  private getMoodleSiteInfo() {
    this.moodleService.getSiteInfo().subscribe(info => {
      this.moodleUrl = info.siteurl;
      this.moodleUrl += '/my';
    });
  }

  private async getCourses() {
    this.courses = [];
    const id = this.currentUser.id;
    const userCourses = await this.moodleService.getCoursesForUser(id).toPromise();

    for (const course of userCourses) {
      const elem: Course = {
        id: course.id,
        name: course.displayname,
        description: course.summary,
      };

      await this.backendService.saveCourse(elem);
      await this.backendService.saveUserCourseMapping(elem.id, this.currentUser.id);

      const res = await this.moodleService.getQuizzesFromCourse(course.id).toPromise();
      const quizzes = res.quizzes;
      elem.quizCount = quizzes.length;
      this.courses.push(elem);
    }

    this.sortCourses();
  }

  private sortCourses(): void {
    this.courses.sort((a: Course, b: Course) => (b.quizCount - a.quizCount));
  }

}
