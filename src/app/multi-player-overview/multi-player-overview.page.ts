import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/services/auth/auth.service';
import { BackendService, MultiPlayerQuestion, User } from 'src/services/backend/backend.service';

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
    console.log(this.rounds);
    console.log(this.currentGame);
  }

  public startNextRound() {
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
