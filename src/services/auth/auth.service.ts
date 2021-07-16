import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { BackendService, User } from '../backend/backend.service';
import { MoodleService } from '../moodle/moodle.service';
import { Storage } from '@ionic/storage';

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
    this.moodleService.getUsers('email', form.email).subscribe(async response => {

      const user = response.users[0];
      if (!user) {
        // User not registered for given moodle instance
        return;
      }

      // Create user in database and navigate to home screen if successful
      this.currentUser.id = user.id;
      this.currentUser.email = user.email;
      this.currentUser.firstname = user.firstname;
      this.currentUser.lastname = user.lastname;
      this.currentUser.username = user.username;
      this.currentUser.loggedIn = true;

      this.backendService.createUser(this.currentUser);
      this.router.navigateByUrl('/home');
    });
  }

  public logout() {
    this.currentUser.loggedIn = false;
  }

  public isLoggedIn(): boolean {
    return this.currentUser.loggedIn;
  }
}
