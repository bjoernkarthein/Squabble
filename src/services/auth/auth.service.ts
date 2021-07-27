import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService, User } from '../backend/backend.service';
import { MoodleService } from '../moodle/moodle.service';
import { Storage } from '@capacitor/storage';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public currentUser: User;

  constructor(
    private router: Router,
    private moodleService: MoodleService,
    private backendService: BackendService) {
    this.currentUser = { id: -1 };
  }

  public login(form) {
    this.moodleService.authenticateAndGetToken(form.email, form.password).subscribe(response => {

      const error = response.error;
      if (error) {
        // Wrong login credentials
        console.log(error);
        return;
      }

      this.currentUser.token = response.token;

      this.moodleService.getUsers('email', form.email).subscribe(async res => {
        const user = res.users[0];
        // Create user in database and navigate to home screen if successful
        this.currentUser.id = user.id;
        this.currentUser.email = user.email;
        this.currentUser.firstname = user.firstname;
        this.currentUser.lastname = user.lastname;
        this.currentUser.username = user.username;
        this.currentUser.loggedIn = true;

        this.backendService.createUser(this.currentUser);

        await Storage.set({
          key: 'currentUser',
          value: JSON.stringify(this.currentUser)
        });
        this.router.navigateByUrl('/home');
      });
    });
  }

  public async logout() {
    await Storage.remove({ key: 'currentUser' });
  }

  public async isLoggedIn(): Promise<boolean> {
    const ret = await Storage.get({ key: 'currentUser' });
    const user = JSON.parse(ret.value);
    return user.loggedIn;
  }

  public async getCurrentUser(): Promise<User> {
    const ret = await Storage.get({ key: 'currentUser' });
    const user = JSON.parse(ret.value);
    return user;
  }
}
