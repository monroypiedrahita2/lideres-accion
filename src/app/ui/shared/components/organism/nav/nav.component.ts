import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { NAME_APP, NAME_LONG_APP } from '../../../const/name-app.const';
import { AuthService } from '../../../services/auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogNotificationComponent } from '../../../dialogs/dialog-notification/dialog-nofication.component';


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

  constructor (private readonly auth: AuthService, public dialog: MatDialog){}

  Logout() {
    const dialogRef = this.dialog.open(DialogNotificationComponent, {
      data: {title: 'Cerrar sesión', message: '¿Estás seguro que deseas cerrar sesión?', type: 'warning', bottons: 'two'},
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('ingresa', result);
      if (result === true) {
        this.auth.logout();
      }
    });

  }



}
