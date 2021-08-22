import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Storage } from '@capacitor/storage';
import { AlertController, ToastController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from 'src/services/auth/auth.service';
import { BackendService, MultiPlayerAttempt, User } from 'src/services/backend/backend.service';
import { MoodleService, QuestionAmount } from 'src/services/moodle/moodle.service';

@Component({
  selector: 'app-course-detail',
  templateUrl: './course-detail.page.html',
  styleUrls: ['./course-detail.page.scss'],
})
export class CourseDetailPage implements OnInit {
  @ViewChild('questions') questions: ElementRef;

  public courseInfo = {};
  public courseContent = {};
  public quizzes: Quiz[] = [];
  public courseId: string;
  public currentUser: User;
  public multiPlayerEnabled: boolean;

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    private moodleService: MoodleService,
    private alertController: AlertController,
    private backendService: BackendService,
    private authService: AuthService,
    private toastController: ToastController
  ) { }

  async ngOnInit() {
    this.currentUser = await this.authService.getCurrentUser();
    this.backendService.startGame.subscribe(data => {
      if (!data) {
        return;
      }
      this.startMultiPlayer(data.courseId, data.opponent);
    });
  }

  async ionViewWillEnter() {
    this.courseId = this.activeRoute.snapshot.paramMap.get('cid');

    this.moodleService.getCourseById(this.courseId).subscribe(info => {
      this.courseInfo = info[0];
    });

    this.moodleService.getCourseContent(this.courseId).subscribe(content => {
      this.courseContent = content[0];
    });

    this.getQuizzes(this.courseId);

    // Checks if the minimal amount of questions exits in the course
    // Feel free to use another value from the QuestionAmount ENUM or set your own.

    this.multiPlayerEnabled = await this.moodleService.checkQuestionAmount(this.courseId, QuestionAmount.MINIMUM);
    console.log(this.multiPlayerEnabled);
  }

  public async startQuizAttempt(quizId: number, disabled: boolean): Promise<void> {
    const attemptInProgress = await Storage.get({ key: 'inProgressAttempt' + quizId });

    if (disabled) {
      return;
    } else if (attemptInProgress.value) {
      this.router.navigateByUrl('/mycourses/' + this.courseId + '/myquizzes/' + quizId);
    } else {
      this.presentAlertConfirm(quizId);
    }
  }

  public async startMultiPlayer(_courseId: string, opponent?: User): Promise<void> {
    if (await this.isOtherRoundInProgress()) {
      this.presentAlertInfo();
      return;
    }

    let _opponentId = null;

    if (!opponent) {
      const randomUser = await this.backendService.getRandomOpponentFromCourse(this.currentUser.id, this.courseId);
      if (randomUser.error) {
        this.showToast('Could not find any other registered users to play against', 'danger');
        return;
      } else {
        this.showToast('Successfully started game against ' + randomUser.firstname + ' ' + randomUser.lastname, 'success');
      }
      _opponentId = randomUser.id;
    } else {
      _opponentId = opponent.id;
    }

    const multiplayerAttempt: MultiPlayerAttempt = {
      initiatorId: this.currentUser.id,
      opponentId: _opponentId,
      courseId: _courseId,
      inProgress: true,
      currentRound: 0,
      questionsAreSet: false,
      nextTurnId: this.currentUser.id,
      turns: 0,
      initiatorPoints: 0,
      opponentPoints: 0
    };

    await this.backendService.saveMultiPlayerAttempt(multiplayerAttempt);
    this.backendService.refreshList.next(true);
  }

  public findPlayer(): void {
    this.router.navigateByUrl('/mycourses/' + this.courseId + '/find-player');
  }

  public invitePlayer(): void {
    this.router.navigateByUrl('/mycourses/' + this.courseId + '/invite-player');
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
        hasQuestions: quiz.hasquestions
      };
      this.quizzes.push(elem);
    }
    this.sortQuizzes();
  }

  private sortQuizzes(): void {
    this.quizzes.sort((a: Quiz, b: Quiz) => a.hasQuestions ? -1 : 1);
  }

  private async isOtherRoundInProgress(): Promise<boolean> {
    const res = await Storage.get({ key: 'currentQuestionNumber' });
    if (res.value) {
      return true;
    } else {
      return false;
    }
  }

  private async presentAlertConfirm(quizId: number): Promise<void> {
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

  private async presentAlertInfo(): Promise<void> {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Failed to start new game',
      message: 'You have to finish all in progress game rounds to start a new game',
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
          }
        }
      ]
    });

    await alert.present();
  }

  private async showToast(msg: string, clr: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 3000,
      animated: true,
      color: clr
    });
    toast.present();
  }
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  hasQuestions?: number;
}
