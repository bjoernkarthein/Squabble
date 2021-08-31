import { AfterViewInit, Component, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from 'src/services/auth/auth.service';
import { BackendService, User } from 'src/services/backend/backend.service';
import { MoodleService } from 'src/services/moodle/moodle.service';

@Component({
  selector: 'app-find-player',
  templateUrl: './find-player.page.html',
  styleUrls: ['./find-player.page.scss'],
})
export class FindPlayerPage implements OnInit, AfterViewInit {
  public students: Map<number, User> = new Map();
  public filteredItems: any[];
  private searchbar;
  private courseId: string;
  private currentUser: User;

  constructor(
    private moodleService: MoodleService,
    private backendService: BackendService,
    private activeRoute: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private alertController: AlertController
  ) { }

  async ngOnInit() {
    this.currentUser = await this.authService.getCurrentUser();
  }

  ngAfterViewInit() {
    this.searchbar = document.querySelector('ion-searchbar');
    this.searchbar.addEventListener('ionInput', this.handleInput);
  }

  async ionViewWillEnter() {
    this.courseId = this.activeRoute.snapshot.paramMap.get('cid');
    const students = await this.backendService.getAllOtherUsersFromCourse(this.currentUser.id, this.courseId);
    if (students.error) {
      return;
    }
    for (const student of students) {
      this.students.set(student.id, student);
    }
    this.removeCurrentUser(this.currentUser.id);
  }

  public startGame(opponent: User) {
    this.presentAlertConfirm(opponent);
  }

  private handleInput(event: any) {
    const filteredItems: any[] = Array.from(document.querySelector('ion-list').children);
    filteredItems.shift();
    const query = event.target.value.toLowerCase();
    requestAnimationFrame(() => {
      filteredItems.forEach(item => {
        const shouldShow = item.textContent.toLowerCase().indexOf(query) > -1;
        item.style.display = shouldShow ? 'block' : 'none';
      });
    });
  }

  private removeCurrentUser(currentUserId: number) {
    this.students.delete(currentUserId);
  }

  private async presentAlertConfirm(_opponent: User): Promise<void> {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Start multi-player game',
      message: 'Do you want to start a game against ' + _opponent.firstname + ' ' + _opponent.lastname,
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
            this.backendService.startGame.next({ opponent: _opponent, courseId: this.courseId });
            this.router.navigateByUrl('/mycourses/' + this.courseId + '/multi-player');
          }
        }
      ]
    });

    await alert.present();
  }

}
