import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { AuthService } from 'src/services/auth/auth.service';
import { BackendService, User } from 'src/services/backend/backend.service';
import { MoodleService, QuestionAmount } from 'src/services/moodle/moodle.service';

@Component({
  selector: 'app-course-detail',
  templateUrl: './course-detail.page.html',
  styleUrls: ['./course-detail.page.scss'],
})
export class CourseDetailPage implements OnInit, AfterViewInit {
  @ViewChild('text') description: ElementRef;

  public title: string; // Course title
  public courseDesc: string; // Course description
  public courseId: string; // Cousre id
  public currentUser: User; // Currently logged in user
  public multiPlayerEnabled: boolean; // If the course has enough questions for multi-player games
  public courseUrl: string; // url of the Moodle course site

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    private moodleService: MoodleService,
    private authService: AuthService,
  ) { }

  async ngOnInit() {
    this.currentUser = await this.authService.getCurrentUser();
  }

  async ngAfterViewInit() {
    this.courseId = this.activeRoute.snapshot.paramMap.get('cid');
    this.courseUrl = this.moodleService.moodleInstalationUrl + '/course/view.php?id=' + this.courseId;

    this.moodleService.getCourseById(this.courseId).subscribe(info => {
      console.log(info);
      this.title = info[0].displayname;
      this.courseDesc = info[0].summary;
    });

    // Checks if the minimal amount of questions exits in the course
    // Feel free to use another value from the QuestionAmount ENUM or set your own.
    // For the application to work properly the value must be greater or equal 3

    this.multiPlayerEnabled = await this.moodleService.checkQuestionAmount(this.courseId, QuestionAmount.MINIMUM);
    console.log(this.multiPlayerEnabled);
    this.description.nativeElement.innerHTML = this.courseDesc;
  }

  // Navigate to single-player page
  public goToSinglePlayer(): void {
    this.router.navigateByUrl(this.router.url + '/single-player');
  }

  // Navigate to multi-player page
  public goToMultiPlayer(): void {
    this.router.navigateByUrl(this.router.url + '/multi-player');
  }
}
