import { Injectable } from '@angular/core';
import { CanLoad, Route, Router, UrlSegment } from '@angular/router';
import { AuthService } from 'src/services/auth/auth.service';
import { MoodleService } from 'src/services/moodle/moodle.service';

@Injectable({
  providedIn: 'root'
})
export class CourseGuard implements CanLoad {
  constructor(private authService: AuthService, private moodleService: MoodleService, private router: Router) { }

  async canLoad(
    route: Route,
    segments: UrlSegment[]): Promise<boolean> {
    let canLoad = false;
    const courseId = segments[1].path;
    const currentUser = await this.authService.getCurrentUser();
    const usersForCourse = await this.moodleService.getEnrolledUsersForCourse(courseId);

    for (const user of usersForCourse) {
      if (user.id === currentUser.id) {
        canLoad = true;
      }
    }

    if (canLoad) {
      return true;
    } else {
      this.router.navigateByUrl('/logged-out');
      return false;
    }
  }
}
