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
  public students: Map<number, User> = new Map(); // Map of all students enrolled in the course and registered at the app
  public filteredItems: any[]; // Students currently displayed in the list, changes with every search
  private searchbar; // searchbar element
  private courseId: string; // ID of the selected course
  private currentUser: User; // currently logged in user

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
    this.searchbar.addEventListener('ionInput', this.handleSearchInput);
  }

  async ionViewWillEnter() {
    this.courseId = this.activeRoute.snapshot.paramMap.get('cid');
    this.getUsersForCourse();
  }

  public startGame(opponent: User): void {
    this.presentAlertConfirm(opponent);
  }

  // Retrieve all users from the current course
  private async getUsersForCourse(): Promise<void> {
    const students = await this.backendService.getAllOtherUsersFromCourse(this.currentUser.id, this.courseId);
    if (students.error) {
      return;
    }
    for (const student of students) {
      this.students.set(student.id, student);
    }
    // Removes the currently logged in user from the list
    this.removeCurrentUser(this.currentUser.id);
  }

  // Search all users in the list
  private handleSearchInput(event: any): void {
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

  /**
   * Presents a pop-up window to notify the player about the game start
   *
   * @param _opponent user object of the possible game opponent
   */
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
