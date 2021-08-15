import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from 'src/services/auth/auth.service';
import { BackendService, MultiPlayerAttempt, User } from 'src/services/backend/backend.service';

@Component({
  selector: 'app-game-preview-item',
  templateUrl: './game-preview-item.component.html',
  styleUrls: ['./game-preview-item.component.scss'],
})
export class GamePreviewItemComponent implements OnInit {
  @Input() public gameId: number;
  @Input() public turn: number;
  @Input() public opponentName: string;
  @Input() public score: string;
  @Input() public inProgress: number;

  public currentUrl: string;
  public turnText: string;
  public status: string;
  private currentUser: User;

  constructor(
    private authService: AuthService,
    private backendService: BackendService
  ) { }

  async ngOnInit() {
    this.currentUser = await this.authService.getCurrentUser();
    this.status = this.inProgress === 1 ? 'In progress' : 'Finished';
    this.currentUrl = window.location.href;
    const game = await this.backendService.getMultiPlayerAttemptById(this.gameId.toString());
    this.getOpponentName(game);
    this.score = this.getScore(this.currentUser.id, game);
    this.turnText = this.getText(game);
  }

  public getScore(id: number, currentGame: MultiPlayerAttempt): string {
    if (id === currentGame.initiatorId) {
      return currentGame.initiatorPoints + ':' + currentGame.opponentPoints;
    } else {
      return currentGame.opponentPoints + ':' + currentGame.initiatorPoints;
    }
  }

  private getText(currentGame: MultiPlayerAttempt): string {
    if (this.inProgress === 0) {
      if (this.currentUser.id === currentGame.initiatorId) {
        if (currentGame.initiatorPoints > currentGame.opponentPoints) {
          return 'WIN';
        } else if (currentGame.initiatorPoints < currentGame.opponentPoints) {
          return 'LOSS';
        } else {
          return 'TIE';
        }
      } else {
        if (currentGame.initiatorPoints < currentGame.opponentPoints) {
          return 'WIN';
        } else if (currentGame.initiatorPoints > currentGame.opponentPoints) {
          return 'LOSS';
        } else {
          return 'TIE';
        }
      }
    } else {
      return this.currentUser.id === this.turn ? 'Your turn' : 'Opponents turn';
    }
  }

  private async getOpponentName(game: MultiPlayerAttempt): Promise<void> {
    const opponent = await this.getOpponent(game.initiatorId, game.opponentId);
    this.opponentName = opponent.firstname + ' ' + opponent.lastname;
  }

  private async getOpponent(initiatorId: number, opponentId: number): Promise<User> {
    const firstPlayer = await this.backendService.getUser(initiatorId);
    const first = firstPlayer[0];
    const secondPlayer = await this.backendService.getUser(opponentId);
    const second = secondPlayer[0];

    let opponent: User;
    if (first.id === this.currentUser.id) {
      opponent = second;
    } else {
      opponent = first;
    }
    return opponent;
  }

}
