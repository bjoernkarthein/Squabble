import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MoodleService } from '../moodle/moodle.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient,
              private router: Router,
              private moodleService: MoodleService) { }

  public login(form) {
    this.moodleService.getUsers('email', form.email).subscribe(response => {
      console.log(response);
      const users = response.users;
      if(!users || users.length <= 0) {
        return;
      }
      this.router.navigateByUrl('/home');
    });
  }
}
