import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
  MatDialog,
} from '@angular/material/dialog';
import { Router, RouterLink } from '@angular/router';
import { ButtonComponent } from '../../components/atoms/button/button.component';
import { CommonModule } from '@angular/common';
import { InputTextComponent } from '../../components/atoms/input-text/input-text.component';
import { PerfilModel } from '../../../../models/perfil/perfil.model';
import { MatIconModule } from '@angular/material/icon';
import { PersonInfoComponent } from '../../components/modules/person-info/person-info.component';
import { PerfilService } from '../../services/perfil/perfil.service';
import { ToastrService } from 'ngx-toastr';
import { DialogNotificationComponent } from '../dialog-notification/dialog-nofication.component';

@Component({
  selector: 'app-dialog-casas-apoyo',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    CommonModule,
    MatButtonModule,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    ButtonComponent,
    RouterLink,
    MatIconModule,
    PersonInfoComponent,
    InputTextComponent
  ],
  templateUrl: './dialog-casas-apoyo.component.html',
  styleUrls: ['./dialog-casas-apoyo.component.scss']
})
export class DialogCasasApoyoComponent {
  usuario: PerfilModel = JSON.parse(localStorage.getItem('usuario') || '{}');
  showSearch: boolean = false;
  cedula: string = '';
  foundUser: PerfilModel | null = null;

  constructor(
    public dialogRef: MatDialogRef<DialogCasasApoyoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly router: Router,
    private readonly perfilService: PerfilService,
    private readonly toast: ToastrService,
    private readonly dialog: MatDialog
  ) { }

  toggleSearch() {
    this.showSearch = !this.showSearch;
    this.foundUser = null;
    this.cedula = '';
  }

  backFromSearch() {
    this.showSearch = false;
    this.foundUser = null;
    this.cedula = '';
  }

  searchUser() {
    if (!this.cedula) {
      this.toast.error('Ingrese una cédula');
      return;
    }

    this.perfilService.getPerfilByDocumento(this.cedula).subscribe((users) => {
      if (users && users.length > 0) {
        this.processUser(users[0] as PerfilModel);
      } else {
        this.toast.error('Usuario no encontrado');
        this.foundUser = null;
      }
    });
  }

  processUser(user: PerfilModel) {
    if (user.postulado?.casaApoyo) {
      this.foundUser = user;
    } else {
      this.foundUser = null;
      this.dialog.open(DialogNotificationComponent, {
        data: {
          title: 'Atención',
          message: 'El voluntario primero debe postularse en Mis Datos para poder ser coordiandor casa de apoyo.',
        }
      });
    }
  }

  approveUser() {
    if (this.foundUser && this.foundUser.id) {
      const updateData: any = { // Using any to bypass partial update strictness if needed, or define specific interface
        casaApoyo: {
          status: true,
          casaApoyoId: '' // ID vacio hasta que registre la casa
        }
      };

      this.perfilService.updatePerfil(this.foundUser.id, updateData).then(() => {
        this.toast.success('Solicitud aprobada correctamente');
        this.foundUser = null;
        this.showSearch = false;
        this.dialogRef.close();
      }).catch((err) => {
        console.error(err);
        this.toast.error('Error al aprobar solicitud');
      });
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  gotoLink(url: string): void {
    // this.router.navigate([url]);
  }

}
