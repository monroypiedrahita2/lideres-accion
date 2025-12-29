import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NAME_APP } from '../../../const/name-app.const';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { ButtonFooterComponent } from '../../atoms/button-footer/button-footer.component';
import { PerfilModel } from '../../../../../models/perfil/perfil.model';
import { MatDialog } from '@angular/material/dialog';
import { DialogAsociarIglesiaComponent } from '../../../dialogs/dialog-asociar-iglesia/dialog-asociar-iglesia.component';
import { Subscription } from 'rxjs';
import { PerfilService } from '../../../services/perfil/perfil.service';

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
export class FooterComponent implements OnInit, OnDestroy {
  usuario: PerfilModel = JSON.parse(localStorage.getItem('usuario') || '{}');
  title: string = NAME_APP;
  private userSubscription: Subscription | undefined;

  constructor(
    private readonly dialog: MatDialog,
    private readonly perfilService: PerfilService
  ) { }

  ngOnInit(): void {
    this.userSubscription = this.perfilService.currentUser$.subscribe(user => {
      if (user) {
        this.usuario = user;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  openAsociarIglesia() {
    this.dialog.open(DialogAsociarIglesiaComponent, {
      width: '400px',
      data: {}
    });
  }

}
