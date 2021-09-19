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

  /**
   * Determines if the user can view the page
   *
   * @returns True if the user is currently logged in, false otherwise
   */
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
