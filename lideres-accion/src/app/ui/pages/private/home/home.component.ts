import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CardInfoComponent } from '../../../shared/components/modules/card-info/card-info.component';
import { CommonModule } from '@angular/common';
import { CardModel } from '../../../../models/utils/card.model';
import { CARDS_HOME } from '../../../shared/const/cards.const';
import { LogoComponent } from '../../../shared/components/atoms/logo/logo.component';
import { NAME_LONG_APP } from '../../../shared/const/name-app.const';
import { AuthService } from '../../../shared/services/auth/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterModule,
    CardInfoComponent,
    CommonModule,
    LogoComponent
  ],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  cards: CardModel[] = CARDS_HOME
  nameLong: string = NAME_LONG_APP


  constructor (private auth: AuthService) {}

  ngOnInit(): void {
      this.authentication()
  }

  authentication() {
    this.auth.getAuth().onAuthStateChanged((data) => {
      
    })
  }

}
