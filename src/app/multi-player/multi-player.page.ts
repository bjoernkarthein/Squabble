import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Storage } from '@capacitor/storage';
import { AlertController, ToastController } from '@ionic/angular';
import { AuthService } from 'src/services/auth/auth.service';
import { BackendService, MultiPlayerAttempt, User } from 'src/services/backend/backend.service';
import { MoodleService } from 'src/services/moodle/moodle.service';

@Component({
  selector: 'app-multi-player',
  templateUrl: './multi-player.page.html',
  styleUrls: ['./multi-player.page.scss'],
})
export class MultiPlayerPage implements OnInit {
  public courseInfo: any = {};
  public courseId: string;
  public currentUser: User;
  public courseUrl: string;

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
    this.courseUrl = this.moodleService.moodleInstalationUrl + '/course/view.php?id=' + this.courseId;

    this.moodleService.getCourseById(this.courseId).subscribe(info => {
      this.courseInfo = info[0];
    });
  }

  public async startMultiPlayer(_courseId: string, opponent?: User): Promise<void> {
    if (await this.isOtherRoundInProgress()) {
      this.presentAlert();
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

  private async isOtherRoundInProgress(): Promise<boolean> {
    const res = await Storage.get({ key: 'currentQuestionNumber' });
    if (res.value) {
      return true;
    } else {
      return false;
    }
  }

  private async presentAlert(): Promise<void> {
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

  private async showToast(msg: string, clr: string): Promise<void> {
    const toast = await this.toastController.create({
      message: msg,
      duration: 3000,
      animated: true,
      color: clr
    });
    toast.present();
  }
}
