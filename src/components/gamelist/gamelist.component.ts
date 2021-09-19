import { Component, Input, OnInit } from '@angular/core';
import { BackendService, User } from 'src/services/backend/backend.service';

@Component({
  selector: 'app-gamelist',
  templateUrl: './gamelist.component.html',
  styleUrls: ['./gamelist.component.scss'],
})
export class GamelistComponent implements OnInit {
  @Input() courseId: string;
  @Input() currentUser: User;

  public multiPlayerGames = [];
  public filteredGames = [];
  public currentValue: string;

  constructor(private backendService: BackendService) {
  }

  ngOnInit() {
    this.backendService.refreshList.subscribe(async value => {
      if (!value) {
        return;
      }
      console.log(this.courseId, this.currentUser.id);
      this.multiPlayerGames = await this.backendService.getMultiPlayerAttemptsByCourseAndUser(this.courseId, this.currentUser.id);
      this.currentValue = 'progress';
      this.filterOpenGames();
    });

    this.currentValue = 'progress';
  }

  public filter(event: any): void {
    if (event.target.value === 'progress') {
      this.filterOpenGames();
    } else {
      this.filterClosedGames();
    }
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

}
