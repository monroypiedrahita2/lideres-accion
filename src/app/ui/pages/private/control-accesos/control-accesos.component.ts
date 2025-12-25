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
import { PersonCardComponent } from '../../../shared/components/modules/person-card/person-card.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DialogControlAccesosComponent } from './dialog-control-accesos/dialog-control-accesos.component';

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
  usuario: any = JSON.parse(localStorage.getItem('usuario') || '{}');
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
    this.perfilService.getPerfilByDocumento(this.form.value.usuario).subscribe({
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

  gestionarRol() {
    if (!this.perfilSeleted) return;

    const dialogRef = this.dialog.open(DialogControlAccesosComponent, {
      width: 'auto',
      data: this.perfilSeleted,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result !== undefined) {
        this.asignarRol(result);
      }
    });
  }

  async asignarRol(rolName: string) {
    const rol = {
      rol: rolName,
      iglesia: this.iglesia,
    };
    try {
      const uidPerfil = this.perfilSeleted?.id;
      await this.perfilService.updatePerfil(uidPerfil!, rol);
      this.toast.success('Rol actualizado correctamente', 'Exito');
      this.getPerfiles(); // Refresh list
      this.clear();
    } catch (error) {
      this.toast.error('Error al asignar el rol', 'Error');
      console.error(error);
    }
  }

  async deleteRol(uid: string) {
    // Confirmation could be added here
    try {
      await this.perfilService.updatePerfil(uid, { rol: '', iglesia: '' });
      this.toast.success('Rol removido correctamente', 'Exito');
      this.getPerfiles(); // Refresh list
    } catch {
      this.toast.error('Error al remover el rol', 'Error');
    }
  }

  clear() {
    this.form.reset();
    this.perfilSeleted = undefined;
  }
}
