import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { NAME_APP, NAME_LONG_APP } from '../../../const/name-app.const';
import { AuthService } from '../../../services/auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogNotificationComponent } from '../../../dialogs/dialog-notification/dialog-nofication.component';
import { Subscription } from 'rxjs';
import { PerfilService } from '../../../services/perfil/perfil.service';
import { PerfilModel } from '../../../../../models/perfil/perfil.model';
import { SidenavComponent } from '../sidenav/sidenav.component';


@Component({
  selector: 'mg-nav',
  templateUrl: './nav.component.html',

  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    RouterModule,
    SidenavComponent
  ],
})
export class NavComponent implements OnInit, OnDestroy {
  usuario: PerfilModel = JSON.parse(localStorage.getItem('usuario') || '{}');
  @Input() titleHeader: string = NAME_APP;
  @Input() foto: string | undefined;
  nameApp = NAME_LONG_APP;
  sub!: Subscription;
  isMenuOpen = false;

  constructor(
    private readonly auth: AuthService,
    public dialog: MatDialog,
    private readonly perfilService: PerfilService
  ) { }

  ngOnInit(): void {
    this.sub = this.perfilService.currentUser$.subscribe((user) => {
      if (user) {
        this.usuario = user;
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  Logout() {
    const dialogRef = this.dialog.open(DialogNotificationComponent, {
      data: { title: 'Cerrar sesión', message: '¿Estás seguro que deseas cerrar sesión?', type: 'warning', bottons: 'two' },
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.auth.logout();
      }
    });

  }
}
