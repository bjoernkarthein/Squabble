import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from 'src/services/auth/auth.service';
import { User } from 'src/services/backend/backend.service';

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

  public turnText: string;
  public status: string;
  private currentUser: User;

  constructor(
    private authService: AuthService,
  ) { }

  async ngOnInit() {
    this.currentUser = await this.authService.getCurrentUser();
    this.turnText = this.turn === this.currentUser.id ? 'Your turn' : 'Opponents turn';
    this.status = this.inProgress === 1 ? 'In progress' : 'Finished';
  }

}

export enum GameProgressStatus {
  IN_PROGRESS = 'In progress',
  FINISHED = 'Finished'
}
