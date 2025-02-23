import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { NAME_APP } from '../../../const/name-app.const';


@Component({
  selector: 'mg-nav',
  templateUrl: './nav.component.html',

  standalone: true,
    imports: [
    CommonModule, 
    MatIconModule,    
    RouterModule
  ],
})
export class NavComponent  {
  @Input() titleHeader: string = NAME_APP;
  @Input() foto: string | undefined;
  nameApp = NAME_APP;



}
