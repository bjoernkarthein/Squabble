import { Injectable } from '@angular/core';
import { CanLoad, Router } from '@angular/router';
import { AuthService } from 'src/services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanLoad {
  constructor(
    private authService: AuthService,
    private router: Router) { }

  async canLoad(): Promise<boolean> {
    const currentUser = await this.authService.getCurrentUser();
    if (currentUser) {
      return true;
    } else {
      this.router.navigateByUrl('/logged-out');
      return false;
    }
  }
}
