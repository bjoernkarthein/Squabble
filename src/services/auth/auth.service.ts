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
  isAuthenticated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  public loggedIn: boolean;
  public currentUserId: number;

  constructor(
    private router: Router,
    private moodleService: MoodleService,
    private backendService: BackendService,
    private storage: Storage) {
    this.initAuthService();
  }

  public async initAuthService() {
    this.currentUser = { id: -1 };
    await this.storage.create();
    this.isLoggedIn();
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

      this.backendService.createUser(this.currentUser);
      this.isAuthenticated.next(true);
      await this.storage.set('loggedIn', true);
      await this.storage.set('user', user.id);
      await this.isLoggedIn();
      await this.getCurrentUserId();
      this.router.navigateByUrl('/home');
    });
  }

  public async logout() {
    this.isAuthenticated.next(false);
    await this.storage.remove('loggedIn');
    await this.storage.remove('user');
    await this.isLoggedIn();
  }

  public async getCurrentUserId() {
    const id = await this.storage.get('user');
    this.currentUserId = id;
  }

  private async isLoggedIn() {
    const value = await this.storage.get('loggedIn');
    this.loggedIn = value;
  }
}
