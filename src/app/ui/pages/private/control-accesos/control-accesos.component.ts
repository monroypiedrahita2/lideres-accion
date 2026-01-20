import { BaseModel } from './../../../../models/base/base.model';
import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { InputSelectComponent } from '../../../shared/components/atoms/input-select/input-select.component';
import { TitleComponent } from '../../../shared/components/atoms/title/title.component';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PerfilService } from '../../../shared/services/perfil/perfil.service';
import { ToastrService } from 'ngx-toastr';
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';
import { PerfilModel } from '../../../../models/perfil/perfil.model';
import { MatIconModule } from '@angular/material/icon';
import { InputTextComponent } from '../../../shared/components/atoms/input-text/input-text.component';
import { PersonCardComponent } from '../../../shared/components/cards/person-card/person-card.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DialogControlAccesosComponent } from './dialog-control-accesos/dialog-control-accesos.component';
import { DialogNotificationComponent } from '../../../shared/dialogs/dialog-notification/dialog-nofication.component';
import { DialogNotificationModel } from '../../../../models/base/dialog-notification.model';

@Component({
  selector: 'app-control-accesos',
  standalone: true,
  imports: [
    CommonModule,
    InputTextComponent,
    TitleComponent,
    ReactiveFormsModule,
    ButtonComponent,
    MatIconModule,
    PersonCardComponent,
    MatDialogModule
  ],
  templateUrl: './control-accesos.component.html',
})
export class ControlAccesosComponent implements OnInit {
  form!: FormGroup;
  usuario: PerfilModel = JSON.parse(localStorage.getItem('usuario') || '{}');
  iglesia: string = JSON.parse(localStorage.getItem('usuario') || '{}').iglesia;
  usuarios: PerfilModel[] = [];
  loading: boolean = false;
  perfilSeleted: PerfilModel | undefined = undefined;

  constructor(
    private readonly fb: FormBuilder,
    private readonly perfilService: PerfilService,
    private readonly toast: ToastrService,
    private readonly dialog: MatDialog
  ) {
    this.form = this.fb.group({
      usuario: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.getPerfiles();
  }

  getPerfil() {
    if (this.form.invalid) return;

    this.loading = true;
    const noCuenta = this.form.value.usuario.toUpperCase();
    this.form.patchValue({ usuario: noCuenta });

    this.perfilService.getPerfilByNoCuenta(noCuenta).subscribe({
      next: (response: any) => {
        this.loading = false;
        if (response && response.length > 0) {
          this.perfilSeleted = response[0];
          this.toast.info(`Perfil de ${this.perfilSeleted?.nombres} seleccionado`);
        } else {
          this.toast.error('El usuario no existe', 'Error');
        }
      },
      error: () => {
        this.loading = false;
        this.toast.error('Error buscar usuario', 'Error');
      },
    });
  }

  getPerfiles() {
    if (this.usuario.rol === 'Super usuario') {
      this.getAllPerfiles();
    } else {
      this.getPerfilesByIglesia();
    }
  }

  getAllPerfiles() {
    this.perfilService.getPerfiles().subscribe({
      next: (response: PerfilModel[]) => {
        this.usuarios = response;
      },
    });
  }

  getPerfilesByIglesia() {
    this.perfilService.getPerfilesByIglesia(this.iglesia).subscribe({
      next: (response: PerfilModel[]) => {
        this.usuarios = response;
      },
    });
  }

  gestionarRol(user?: PerfilModel) {
    const targetUser = user || this.perfilSeleted;

    if (!targetUser) return;

    const dialogRef = this.dialog.open(DialogControlAccesosComponent, {
      width: 'auto',
      data: targetUser,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== undefined) {
        this.asignarRol(result, targetUser.id!);
      }
    });
  }

  async asignarRol(data: any, uid: string) {
    // data comes from dialog as:
    // { rol: string | null, coordinadorTransporte: boolean, coordinadorTestigos: boolean, coordinadorCasaApoyo: string | null }

    // We need to merge this with: iglesia: this.iglesia

    // If coordinadorCasaApoyo is 'PENDING', we might need to preserve the old value if we didn't fetch it, 
    // but here we are in full control. The dialog should ideally return the final state or we merge carefully.
    // However, the prompt says "si escoge alguno de los demas tambien si o si debe seleccionar coordindor de iglesia"
    // The dialog returns the "permissions" state.

    const updateData: any = {
      rol: data.rol,
      iglesia: this.iglesia,
      coordinadorTransporte: data.coordinadorTransporte,
      coordinadorTestigos: data.coordinadorTestigos,
      coordinadorCasaApoyo: data.coordinadorCasaApoyo,
    };

    // Clean up undefined/nulls if necessary, but updatePerfil likely handles partials if we want.
    // But here we are setting the roles, so we want to overwrite.

    try {
      await this.perfilService.updatePerfil(uid, updateData);
      this.toast.success('Roles actualizados correctamente', 'Exito');
      this.getPerfiles(); // Refresh list

      // If we were editing the selected user in the search box, refresh it too or clear
      if (this.perfilSeleted && this.perfilSeleted.id === uid) {
        // Verify if we should keep it selected with new data or clear
        // For now, let's clear to avoid stale data display
        this.clear();
      }

    } catch (error) {
      this.toast.error('Error al asignar el rol', 'Error');
      console.error(error);
    }
  }

  deleteRol(uid: string) {
    const dialogRef = this.dialog.open(DialogNotificationComponent, {
      minWidth: '350px',
      maxWidth: '500px',
      data: {
        title: 'Eliminar Rol',
        message:
          '¿Estás seguro de que deseas eliminar el rol asignado a este usuario? Esta acción no se puede deshacer.',
        type: 'warning',
        bottons: 'two',
      } as DialogNotificationModel,
    });

    dialogRef.afterClosed().subscribe(async (result: boolean) => {
      if (result) {
        try {
          await this.perfilService.updatePerfil(uid, { rol: '', iglesia: '' });
          this.toast.success('Rol removido correctamente', 'Exito');
          this.getPerfiles();
        } catch {
          this.toast.error('Error al remover el rol', 'Error');
        }
      }
    });
  }

  clear() {
    this.form.reset();
    this.perfilSeleted = undefined;
  }
}
