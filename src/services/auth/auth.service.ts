import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService, User } from '../backend/backend.service';
import { MoodleService } from '../moodle/moodle.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public currentUser: User;

  constructor(private http: HttpClient,
              private router: Router,
              private moodleService: MoodleService,
              private backendService: BackendService) { }

  public login(form) {
    this.moodleService.getUsers('email', form.email).subscribe(response => {
      console.log(response);
      const user = response.users[0];
      if(!user) {
        return;
      }

      this.currentUser.id = user.id;
      this.currentUser.email = user.email;
      this.currentUser.firstname = user.firstname;
      this.currentUser.lastname = user.lastname;
      this.currentUser.username = user.username;

      this.backendService.createUser(this.currentUser);
      this.router.navigateByUrl('/home');
    });
  }
}
