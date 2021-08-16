import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService, MultiPlayerStatistic, User } from '../backend/backend.service';
import { MoodleService } from '../moodle/moodle.service';
import { Storage } from '@capacitor/storage';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public currentUser: User;
  public loginCheck = new BehaviorSubject<boolean>(true);
  public closeUserMenu = new BehaviorSubject<boolean>(false);

  constructor(
    private router: Router,
    private moodleService: MoodleService,
    private backendService: BackendService) {
    this.currentUser = { id: -1 };
  }

  public async login(form) {
    const tokenResponse = await this.moodleService.authenticateAndGetToken(form.email, form.password).toPromise();
    const error = tokenResponse.error;
    if (error) {
      // Wrong login credentials
      this.loginCheck.next(false);
      return;
    }
    this.currentUser.token = tokenResponse.token;

    let user;
    const userWithMailResponse = await this.moodleService.getUsers('email', form.email).toPromise();
    const userbyMail = userWithMailResponse.users[0];
    if (userbyMail) {
      user = userbyMail;
    } else {
      const userWithUsernameResponse = await this.moodleService.getUsers('username', form.email).toPromise();
      const userbyUsername = userWithUsernameResponse.users[0];
      if (!userbyUsername) {
        return;
      }
      user = userbyUsername;
    }

    this.currentUser.id = user.id;
    this.currentUser.email = user.email;
    this.currentUser.firstname = user.firstname;
    this.currentUser.lastname = user.lastname;
    this.currentUser.username = user.username;
    this.currentUser.loggedIn = true;

    this.backendService.createUser(this.currentUser);
    this.addStatisticEntry(this.currentUser.id);

    await Storage.set({
      key: 'currentUser',
      value: JSON.stringify(this.currentUser)
    });

    this.loginCheck.next(true);
    this.router.navigateByUrl('/home');
  }

  public async logout() {
    await Storage.remove({ key: 'currentUser' });
  }

  public async isLoggedIn(): Promise<boolean> {
    const ret = await Storage.get({ key: 'currentUser' });
    if (!ret.value) {
      return false;
    }
    const user = JSON.parse(ret.value);
    return user.loggedIn;
  }

  public async getCurrentUser(): Promise<User> {
    const ret = await Storage.get({ key: 'currentUser' });
    const user = JSON.parse(ret.value);
    return user;
  }

  private async addStatisticEntry(_userId: number) {
    const userStatistic: MultiPlayerStatistic = {
      userId: _userId,
      totalWins: 0,
      totalLosses: 0,
      totalRight: 0,
      totalWrong: 0
    };
    await this.backendService.addMultiPlayerStatistic(userStatistic);
  }
}
