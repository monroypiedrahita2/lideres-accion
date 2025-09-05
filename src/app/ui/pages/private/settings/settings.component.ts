import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { CARDS_HOME } from '../../../shared/const/cards.const';
import { CardModel } from '../../../../models/utils/card.model';
import { CardInfoComponent } from '../../../shared/components/modules/card-info/card-info.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterModule, CardInfoComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  cards: CardModel[] = CARDS_HOME;
  constructor(
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

  async logout() {
    try {
      await this.auth.logout();
      this.router.navigate(['./public/login']);
    } catch (error) {
      console.error(error);
    }
  }
}
