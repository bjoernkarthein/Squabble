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

  /**
   * Login the user and update localStorage
   *
   * @param form The form data from the login page
   */
  public async login(form) {
    const tokenResponse = await this.moodleService.authenticateAndGetToken(form.email, form.password).toPromise();
    const error = tokenResponse.error;
    if (error) {
      // Wrong login credentials
      this.loginCheck.next(false);
      console.log(tokenResponse);
      return;
    }
    this.currentUser.token = tokenResponse.token;

    let user;
    const userWithMailResponse = await this.moodleService.getUsers('email', form.email).toPromise();
    const userbyMail = userWithMailResponse.users[0];
    if (userbyMail) {
      // user used email to authenticate
      user = userbyMail;
    } else {
      const userWithUsernameResponse = await this.moodleService.getUsers('username', form.email).toPromise();
      const userbyUsername = userWithUsernameResponse.users[0];
      if (!userbyUsername) {
        // wrong user credentials
        return;
      }
      // user used username to authenticate
      user = userbyUsername;
    }

    // build current user object
    this.currentUser.id = user.id;
    this.currentUser.email = user.email;
    this.currentUser.firstname = user.firstname;
    this.currentUser.lastname = user.lastname;
    this.currentUser.username = user.username;
    this.currentUser.loggedIn = true;
    this.currentUser.profileimageurlsmall = user.profileimageurlsmall;
    this.currentUser.profileimageurl = user.profileimageurl;

    // Create user in database
    this.backendService.createUser(this.currentUser);

    // Set currentUser in LocalStorage to remember information on reloads
    await Storage.set({
      key: 'currentUser',
      value: JSON.stringify(this.currentUser)
    });

    // successfull login
    this.loginCheck.next(true);
    this.router.navigateByUrl('/home');
  }

  /**
   * Log out currently signed in user
   */
  public async logout() {
    await Storage.remove({ key: 'currentUser' });
  }

  /**
   * Check if current user is logged in
   *
   * @returns true if the current user is logged in
   */
  public async isLoggedIn(): Promise<boolean> {
    const ret = await Storage.get({ key: 'currentUser' });
    if (!ret.value) {
      return false;
    }
    const user = JSON.parse(ret.value);
    return user.loggedIn;
  }

  /**
   * Get the current user
   *
   * @returns The currently signed in user
   */
  public async getCurrentUser(): Promise<User> {
    const ret = await Storage.get({ key: 'currentUser' });
    const user = JSON.parse(ret.value);
    return user;
  }
}
