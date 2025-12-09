import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NAME_APP } from '../../../const/name-app.const';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { ButtonFooterComponent } from '../../atoms/button-footer/button-footer.component';
import { PerfilModel } from '../../../../../models/perfil/perfil.model';

@Component({
  selector: 'mtt-footer',
  templateUrl: './footer.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    ButtonFooterComponent,
    RouterModule,
  ],
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  usuario: PerfilModel = JSON.parse(localStorage.getItem('usuario') || '{}');
  title: string = NAME_APP;

}
