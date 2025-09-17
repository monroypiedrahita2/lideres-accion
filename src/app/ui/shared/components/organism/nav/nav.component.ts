import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { NAME_APP, NAME_LONG_APP } from '../../../const/name-app.const';


@Component({
  selector: 'mg-nav',
  templateUrl: './nav.component.html',

  standalone: true,
    imports: [
    CommonModule,
    MatIconModule,
    RouterModule,
  ],
})
export class NavComponent  {
  usuario: any = JSON.parse(localStorage.getItem('usuario') || '{}');
  @Input() titleHeader: string = NAME_APP;
  @Input() foto: string | undefined;
  nameApp = NAME_LONG_APP;



}
