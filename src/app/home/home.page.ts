import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/services/auth/auth.service';
import { BackendService, Course, MultiPlayerStatistic, User } from 'src/services/backend/backend.service';
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
  ) { }

  async ngOnInit(): Promise<void> {
    this.currentUser = await this.authService.getCurrentUser();

    this.getMoodleSiteInfo();
    this.getCourses();
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
    const userId = this.currentUser.id;
    const userCourses = await this.moodleService.getCoursesForUser(userId).toPromise();

    for (const course of userCourses) {
      const elem: Course = {
        id: course.id,
        name: course.displayname,
        description: course.summary,
      };

      await this.backendService.saveCourse(elem);
      await this.backendService.saveUserCourseMapping(elem.id, this.currentUser.id);
      await this.addStatisticEntry(userId, course.id);

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

  private async addStatisticEntry(_userId: number, _courseId: number) {
    const userStatistic: MultiPlayerStatistic = {
      userId: _userId,
      courseId: _courseId,
      totalWins: 0,
      totalLosses: 0,
      totalRight: 0,
      totalWrong: 0
    };
    await this.backendService.addMultiPlayerStatistic(userStatistic);
  }

}
