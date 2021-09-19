import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from 'src/services/auth/auth.service';
import { BackendService, User } from 'src/services/backend/backend.service';
import { MoodleService } from 'src/services/moodle/moodle.service';

@Component({
  selector: 'app-invite-player',
  templateUrl: './invite-player.page.html',
  styleUrls: ['./invite-player.page.scss'],
})
export class InvitePlayerPage implements OnInit, AfterViewInit {
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
    this.searchbar.addEventListener('ionInput', this.handleSearchInput);
  }

  // Get all users from the Moodle course that are not registered at the Squabble app
  async ionViewWillEnter() {
    this.courseId = this.activeRoute.snapshot.paramMap.get('cid');
    const students = await this.moodleService.getEnrolledUsersForCourse(this.courseId);
    const registeredStudents = await this.backendService.getAllOtherUsersFromCourse(this.currentUser.id, this.courseId);
    console.log(registeredStudents);
    if (students.error) {
      return;
    }
    for (const student of students) {
      this.students.set(student.id, student);
    }

    // Removes current user
    this.students.delete(this.currentUser.id);

    if (registeredStudents.error) {
      return;
    }

    // Removes already registered users
    this.removeRegisteredUsers(registeredStudents);
  }

  public inviteUser(opponent: User) {
    this.presentAlertConfirm(opponent);
  }

  // Search all users in the list
  private handleSearchInput(event: any) {
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

  private removeRegisteredUsers(registeredUsers: User[]): void {
    for (const user of registeredUsers) {
      this.students.delete(user.id);
    }
  }

  private sendInvitationMail(opponent: User): void {
    // TODO: This is commented out for now as the right mailserver credentials need to be provided in the API
    // TODO: After providing the right credentials in the API this line can be enabled and sending mails works
    // this.backendService.sendInvitationMail(this.currentUser, opponent);
  }

  /**
   * Presents a pop-up window to notify the player about the sending of the mail
   *
   * @param _opponent user object of the invited player
   */
  private async presentAlertConfirm(_opponent: User): Promise<void> {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Invite ' + _opponent.firstname + ' ' + _opponent.lastname,
      message: 'Do you want to send ' + _opponent.firstname + ' ' + _opponent.lastname + ' an invitation mail to play some games?',
      buttons: [
        {
          text: 'No thank you',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
          }
        }, {
          text: 'Yes send the mail!',
          handler: () => {
            this.sendInvitationMail(_opponent);
          }
        }
      ]
    });

    await alert.present();
  }

}
