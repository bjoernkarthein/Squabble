import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from 'src/services/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) { }

  async ngOnInit() {
    this.authService.loginCheck.subscribe(succsessfullLogin => {
      if (!succsessfullLogin) {
        this.showToast('Wrong login credentials', 'danger');
      }
    });

    const loggedIn = await this.authService.isLoggedIn();
    if (loggedIn) {
      this.router.navigateByUrl('/home');
    }
  }

  public login(form) {
    this.authService.login(form.value);
  }

  private async showToast(msg: string, clr: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 3000,
      animated: true,
      color: clr
    });
    toast.present();
  }
}
