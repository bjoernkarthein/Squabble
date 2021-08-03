import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/services/auth/auth.service';
import { BackendService, User } from 'src/services/backend/backend.service';

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
  public rounds: Round[] = [{ num: 1 }, { num: 2 }, { num: 3 }];
  private currentUser: User;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private backendService: BackendService,
    private authService: AuthService
  ) { }

  ngOnInit() {

  }

  async ionViewWillEnter() {
    this.attemptId = this.route.snapshot.paramMap.get('gid');
    this.currentGame = await this.backendService.getMultiPlayerAttemptById(this.attemptId);
    console.log(this.currentGame);
    this.currentUser = await this.authService.getCurrentUser();
    await this.getPlayers();
    this.myTurn = this.currentGame.nextTurnId === this.myself.id;
    this.finished = this.currentGame.inprogress === 0;
  }

  public startNextRound() {
    if (this.currentGame.questionsAreSet === 0) {
      this.currentGame.currentRound++;
    }
    this.router.navigateByUrl('/multi-player-overview/' + this.attemptId + '/multi-player-round/' + this.currentGame.currentRound);
  }

  private async getPlayers(): Promise<void> {
    const firstPlayer = await this.backendService.getUser(this.currentGame.initiatorId).toPromise();
    const first = firstPlayer[0];
    const secondPlayer = await this.backendService.getUser(this.currentGame.opponentId).toPromise();
    const second = secondPlayer[0];

    if (first.id === this.currentUser.id) {
      this.myself = first;
      this.opponent = second;
    } else {
      this.myself = second;
      this.opponent = first;
    }

    console.log(this.myself, this.opponent);
  }

}

export interface Round {
  num: number;
  playerResults?: Map<number, any>;
}
