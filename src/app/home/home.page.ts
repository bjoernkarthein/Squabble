import { Component } from '@angular/core';
import { MoodleService } from 'src/services/moodle/moodle.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage {

  public courseName: string;
  public courseUrl: string;

  constructor(private moodleService: MoodleService) {
    this.getMoodleCourseInfo();
  }

  public getMoodleCourseInfo() {
    this.moodleService.getCourseInfo().subscribe(info => {
      this.courseName = info.sitename;
      this.courseUrl = info.siteurl;
    });
  }

}
