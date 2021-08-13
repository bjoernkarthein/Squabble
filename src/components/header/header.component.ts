import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { UserMenuComponent } from 'src/components/user-menu/user-menu.component';
import { AuthService } from 'src/services/auth/auth.service';
import { User } from 'src/services/backend/backend.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {

  @Input() title: string;
  @Input() backButtonLink: string;
  @Input() showLogo: boolean;

  public currentPopover: HTMLIonPopoverElement;
  public currentUser: User;

  constructor(private popoverController: PopoverController, private authService: AuthService) { }

  async ngOnInit() {
    this.authService.closeUserMenu.subscribe(close => {
      if (close) {
        this.dismissPopover();
      }
    });
    this.currentUser = await this.authService.getCurrentUser();
  }

  public async presentPopover(ev: any): Promise<void> {
    this.currentPopover = await this.popoverController.create({
      component: UserMenuComponent,
      cssClass: 'my-custom-class',
      event: ev,
      translucent: true
    });
    await this.currentPopover.present();

    const { role } = await this.currentPopover.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }

  private dismissPopover(): void {
    if (this.currentPopover) {
      this.currentPopover.dismiss().then(() => { this.currentPopover = null; });
    }
  }

}
