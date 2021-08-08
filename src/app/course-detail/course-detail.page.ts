import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { MoodleService } from 'src/services/moodle/moodle.service';
import { Storage } from '@capacitor/storage';
import { GameProgressStatus } from 'src/components/game-preview-item/game-preview-item.component';
import { BackendService, MultiPlayerAttempt, User } from 'src/services/backend/backend.service';
import { AuthService } from 'src/services/auth/auth.service';

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
  public multiPlayerGames = [];
  public filteredGames = [];

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
    this.multiPlayerGames = await this.backendService.getMultiPlayerAttemptsByCourseAndUser(this.courseId, this.currentUser.id);
    this.filterOpenGames();
  }

  public async startQuizAttempt(quizId: number, disabled: boolean): Promise<void> {
    const attemptInProgress = await Storage.get({ key: 'inProgressAttempt' + quizId });
    console.log(attemptInProgress);
    if (disabled) {
      return;
    } else if (attemptInProgress.value) {
      this.router.navigateByUrl('/mycourses/' + this.courseId + '/myquizzes/' + quizId);
    } else {
      this.presentAlertConfirm(quizId);
    }
  }

  public async startMultiPlayer(): Promise<void> {
    const randomUser = await this.backendService.getRandomOpponentFromCourse(this.currentUser.id, this.courseId);

    if (randomUser.error) {
      this.showToast('Could not find any other registered users to play against', 'danger');
      return;
    } else {
      this.showToast('Successfully started game against ' + randomUser.firstname + ' ' + randomUser.lastname, 'success');
    }

    const oId = randomUser.id;
    const multiplayerAttempt: MultiPlayerAttempt = {
      initiatorId: this.currentUser.id,
      opponentId: oId,
      courseId: this.courseId,
      inProgress: true,
      currentRound: 0,
      questionsAreSet: false,
      nextTurnId: this.currentUser.id,
      turns: 0,
      initiatorPoints: 0,
      opponentPoints: 0
    };

    await this.backendService.saveMultiPlayerAttempt(multiplayerAttempt);
    this.multiPlayerGames = await this.backendService.getMultiPlayerAttemptsByCourseAndUser(this.courseId, this.currentUser.id);
    this.filterOpenGames();
  }

  public filter(event: any): void {
    console.log(event.target.value);
    if (event.target.value === 'progress') {
      this.filterOpenGames();
    } else {
      this.filterClosedGames();
    }
  }

  public async getOpponentName(game: MultiPlayerAttempt) {
    const opponent = await this.getOpponent(game.initiatorId, game.opponentId);
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

  private filterOpenGames(): void {
    this.filteredGames = [];
    for (const game of this.multiPlayerGames) {
      if (game.inprogress === 1) {
        this.filteredGames.push(game);
      }
    }
  }

  private filterClosedGames(): void {
    this.filteredGames = [];
    for (const game of this.multiPlayerGames) {
      if (game.inprogress === 0) {
        this.filteredGames.push(game);
      }
    }
  }

  private async getOpponent(initiatorId: number, opponentId: number): Promise<User> {
    const firstPlayer = await this.backendService.getUser(initiatorId).toPromise();
    const first = firstPlayer[0];
    const secondPlayer = await this.backendService.getUser(opponentId).toPromise();
    const second = secondPlayer[0];

    let opponent: User;
    if (first.id === this.currentUser.id) {
      opponent = second;
    } else {
      opponent = first;
    }
    return opponent;
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
