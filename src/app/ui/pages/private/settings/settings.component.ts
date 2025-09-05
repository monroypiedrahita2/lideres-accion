import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TitleComponent } from '../../../shared/components/atoms/title/title.component';
import { ButtonSettingsComponent } from '../../../shared/components/atoms/button-settings/button-settings.component';
import { AuthService } from '../../../shared/services/auth/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [RouterModule, ButtonSettingsComponent, TitleComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  constructor(private auth: AuthService, private router: Router) {}

  async logout() {
    try {
      await this.auth.logout();
      this.router.navigate(['./public/login']);
    } catch (error) {
      console.error(error);
    }
  }
}
