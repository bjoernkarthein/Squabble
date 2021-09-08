import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Storage } from '@capacitor/storage';
import { AlertController } from '@ionic/angular';
import { AuthService } from 'src/services/auth/auth.service';
import { User } from 'src/services/backend/backend.service';
import { MoodleService } from 'src/services/moodle/moodle.service';

@Component({
  selector: 'app-single-player',
  templateUrl: './single-player.page.html',
  styleUrls: ['./single-player.page.scss'],
})
export class SinglePlayerPage implements OnInit {
  public courseInfo: any = {};
  public quizzes: Quiz[] = [];
  public courseId: string;
  public currentUser: User;
  public courseUrl: string;

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    private moodleService: MoodleService,
    private alertController: AlertController,
    private authService: AuthService,
  ) { }

  async ngOnInit() {
    this.currentUser = await this.authService.getCurrentUser();
  }

  async ionViewWillEnter() {
    this.courseId = this.activeRoute.snapshot.paramMap.get('cid');
    this.courseUrl = this.moodleService.moodleInstalationUrl + 'course/view.php?id=' + this.courseId;

    this.moodleService.getCourseById(this.courseId).subscribe(info => {
      this.courseInfo = info[0];
    });

    this.getQuizzes(this.courseId);
  }

  public async startQuizAttempt(quizId: number, disabled: boolean): Promise<void> {
    const attemptInProgress = await Storage.get({ key: 'inProgressAttempt' + quizId });

    if (disabled) {
      return;
    } else if (attemptInProgress.value) {
      this.router.navigateByUrl('/mycourses/' + this.courseId + '/myquizzes/' + quizId);
    } else {
      this.presentAlert(quizId);
    }
  }

  public goToExternalUrl(url: string): void {
    document.location.href = url;
  }

  private async getQuizzes(courseId: string): Promise<void> {
    this.quizzes = [];
    const response = await this.moodleService.getQuizzesFromCourse(courseId).toPromise();
    const quizzes = response.quizzes;
    for (const quiz of quizzes) {
      const elem: Quiz = {
        id: quiz.id,
        title: quiz.name,
        description: quiz.intro,
        hasQuestions: quiz.hasquestions,
        url: this.moodleService.moodleInstalationUrl + '/mod/quiz/view.php?id=' + quiz.coursemodule
      };
      this.quizzes.push(elem);
    }
    this.sortQuizzes();
  }

  private sortQuizzes(): void {
    this.quizzes.sort((a: Quiz, b: Quiz) => a.hasQuestions ? -1 : 1);
  }

  private async presentAlert(quizId: number): Promise<void> {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Start Quiz Attempt',
      message: 'You are about to start an attempt for the selected Quiz. Do you wish to continue?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
          }
        }, {
          text: 'Continue',
          handler: () => {
            this.router.navigateByUrl('/mycourses/' + this.courseId + '/myquizzes/' + quizId);
          }
        }
      ]
    });

    await alert.present();
  }
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  hasQuestions?: number;
  url: string;
}
