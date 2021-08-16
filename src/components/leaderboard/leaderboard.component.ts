import { Component, Input, OnInit } from '@angular/core';
import { BackendService, MultiPlayerStatistic } from 'src/services/backend/backend.service';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss'],
})
export class LeaderboardComponent implements OnInit {
  @Input() public courseId: string;
  public userStatistics: any[];

  constructor(private backendService: BackendService) { }

  async ngOnInit() {
    this.userStatistics = await this.backendService.getMultiPlayerStatisticByCourseId(this.courseId);
    console.log(this.userStatistics);
  }

}
