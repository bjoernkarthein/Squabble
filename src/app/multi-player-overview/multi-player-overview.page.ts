import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from 'src/services/auth/auth.service';
import { BackendService, MultiPlayerQuestion, User } from 'src/services/backend/backend.service';
import { Storage } from '@capacitor/storage';

@Component({
  selector: 'app-multi-player-overview',
  templateUrl: './multi-player-overview.page.html',
  styleUrls: ['./multi-player-overview.page.scss'],
})
export class MultiPlayerOverviewPage implements OnInit {

  public attemptId: string;
  public currentGame;
  public opponent: User;
  public myself: User;
  public myTurn: boolean;
  public finished: boolean;
  public rounds: Map<number, MultiPlayerQuestion[]> = new Map();
  private currentUser: User;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private backendService: BackendService,
    private authService: AuthService,
    private alertController: AlertController
  ) { }

  ngOnInit() {

  }

  async ionViewWillEnter() {
    this.attemptId = this.route.snapshot.paramMap.get('gid');
    this.currentGame = await this.backendService.getMultiPlayerAttemptById(this.attemptId);

    this.currentUser = await this.authService.getCurrentUser();
    await this.getPlayers();
    this.myTurn = this.currentGame.nextTurnId === this.myself.id;
    this.finished = this.currentGame.inprogress === 0;

    this.rounds.clear();
    for (let i = 1; i <= this.currentGame.currentRound; i++) {
      const rounds = await this.backendService.getMultiPlayerQuestions(this.attemptId, i);
      for (const round of rounds) {
        if (this.rounds.has(round.roundNumber)) {
          this.rounds.get(round.roundNumber).push(round);
        } else {
          this.rounds.set(round.roundNumber, []);
          this.rounds.get(round.roundNumber).push(round);
        }
      }
    }

  }

  public async startNextRound() {
    if (await this.isOtherRoundInProgress(this.attemptId)) {
      this.presentAlertInfo();
      return;
    }

    if (this.currentGame.questionsAreSet === 0) {
      this.currentGame.currentRound++;
    }

    const currentUrl = window.location.pathname;
    this.router.navigateByUrl(currentUrl + '/multi-player-round/' + this.currentGame.currentRound);
  }

  public getRightPlayerValue(id: number): number {
    if (id === this.currentGame.initiatorId) {
      return 1;
    } else {
      return 2;
    }
  }

  public getFinishedStatus(id: number, round: MultiPlayerQuestion): boolean {
    if (id === this.currentGame.initiatorId) {
      return round.playerOneRight !== null;
    } else {
      return round.playerTwoRight !== null;
    }
  }

  public getScore(id: number): string {
    if (id === this.currentGame.initiatorId) {
      return this.currentGame.initiatorPoints + ':' + this.currentGame.opponentPoints;
    } else {
      return this.currentGame.opponentPoints + ':' + this.currentGame.initiatorPoints;
    }
  }

  private async getPlayers(): Promise<void> {
    const firstPlayer = await this.backendService.getUser(this.currentGame.initiatorId);
    const first = firstPlayer[0];
    const secondPlayer = await this.backendService.getUser(this.currentGame.opponentId);
    const second = secondPlayer[0];

    if (first.id === this.currentUser.id) {
      this.myself = first;
      this.opponent = second;
    } else {
      this.myself = second;
      this.opponent = first;
    }
  }

  private async isOtherRoundInProgress(gameId: string): Promise<boolean> {
    const res = await Storage.get({ key: 'multiplayerQuestions' });
    if (res.value) {
      const multiplayerQuestions = JSON.parse(res.value).mpq;
      console.log(multiplayerQuestions[0].gameId, gameId);
      if (multiplayerQuestions[0].gameId !== gameId) {
        return true;
      }
    } else {
      return false;
    }
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

}
