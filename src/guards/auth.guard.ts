import { Injectable } from '@angular/core';
import { CanLoad, Route, Router, UrlSegment, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'src/services/auth/auth.service';
import { filter, map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanLoad {
  constructor(
    private authService: AuthService,
    private router: Router) { }

  canLoad(): boolean {
    // if (this.authService.isLoggedIn()) {
    //   return true;
    // } else {
    //   this.router.navigateByUrl('/logged-out');
    //   return false;
    // }
    return true;
  }
}
