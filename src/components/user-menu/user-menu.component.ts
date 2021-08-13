import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/services/auth/auth.service';
import { User } from 'src/services/backend/backend.service';

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss'],
})
export class UserMenuComponent implements OnInit {
  public currentUser: User;

  constructor(private authService: AuthService, private router: Router) { }

  async ngOnInit() {
    this.currentUser = await this.authService.getCurrentUser();
  }

  public logout(): void {
    this.authService.closeUserMenu.next(true);
    this.authService.logout();
    this.router.navigateByUrl('/', { replaceUrl: true });
  }

}
