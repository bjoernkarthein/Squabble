import { Component, Input, OnInit } from '@angular/core';
import { BackendService, MultiPlayerStatistic } from 'src/services/backend/backend.service';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss'],
})
export class LeaderboardComponent implements OnInit {
  @Input() public courseId: string;

  public userStatistics: MultiPlayerStatistic[];
  private iconStates: boolean[] = new Array(3);

  constructor(private backendService: BackendService) { }

  async ngOnInit() {
    this.userStatistics = await this.backendService.getMultiPlayerStatisticByCourseId(this.courseId);
    this.sortList('wins');
    console.log(this.userStatistics);
  }

  public getIcon(index: number): string {
    if (this.iconStates[index]) {
      return 'arrow-up-outline';
    } else {
      return 'arrow-down-outline';
    }
  }

  public sortList(value: string): void {
    switch (value) {
      case 'wins':
        this.iconStates[0] = !this.iconStates[0];
        this.sortWins(this.iconStates[0]);
        break;
      case 'right':
        this.iconStates[1] = !this.iconStates[1];
        this.sortRight(this.iconStates[1]);
        break;
      case 'games':
        this.iconStates[2] = !this.iconStates[2];
        this.sortGames(this.iconStates[2]);
        break;
    }
  }

  private sortWins(descending: boolean): void {
    this.userStatistics.sort((a: MultiPlayerStatistic, b: MultiPlayerStatistic) => {
      if (descending) {
        return (b.totalWins) - (a.totalWins);
      } else {
        return (a.totalWins) - (b.totalWins);
      }
    });
  }

  private sortRight(descending: boolean): void {
    this.userStatistics.sort((a: MultiPlayerStatistic, b: MultiPlayerStatistic) => {
      if (descending) {
        return (b.totalRight) - (a.totalRight);
      } else {
        return (a.totalRight) - (b.totalRight);
      }
    });
  }

  private sortGames(descending: boolean): void {
    this.userStatistics.sort((a: MultiPlayerStatistic, b: MultiPlayerStatistic) => {
      if (descending) {
        return (b.totalLosses + b.totalWins) - (a.totalLosses + a.totalWins);
      } else {
        return (a.totalLosses + a.totalWins) - (b.totalLosses + b.totalWins);
      }
    });
  }

}
