import { Component } from '@angular/core';
import { BackendService } from 'src/services/backend/backend.service';
import { MoodleService } from 'src/services/moodle/moodle.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage {

  public courseName: string;
  public courseUrl: string;

  constructor(
    private moodleService: MoodleService,
    private backendService: BackendService
  ) {
    this.getMoodleCourseInfo();
    this.testBackendSerice();
  }

  private getMoodleCourseInfo() {
    this.moodleService.getCourseInfo().subscribe(info => {
      this.courseName = info.sitename;
      this.courseUrl = info.siteurl;
    });
  }

  private testBackendSerice() {
    this.backendService.getAuthors().subscribe(authors => {
      console.log(authors);
    });
  }

}
