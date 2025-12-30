import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MatDialogContent, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { InputTextComponent } from '../../components/atoms/input-text/input-text.component';
import { CardInfoComponent } from '../../components/cards/card-info/card-info.component';
import { ButtonComponent } from '../../components/atoms/button/button.component';
import { PerfilService } from '../../services/perfil/perfil.service';
import { PerfilModel } from '../../../../models/perfil/perfil.model';

@Component({
    selector: 'app-dialog-asociar-iglesia',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        InputTextComponent,
        CardInfoComponent,
        ButtonComponent
    ],
    templateUrl: './dialog-asociar-iglesia.component.html',
})
export class DialogAsociarIglesiaComponent {
    documentoControl = new FormControl('', [Validators.required]);
    perfilEncontrado: PerfilModel | null = null;
    usuario: PerfilModel = JSON.parse(localStorage.getItem('usuario') || '{}');

    constructor(
        public dialogRef: MatDialogRef<DialogAsociarIglesiaComponent>,
        private perfilService: PerfilService,
        private toastr: ToastrService
    ) { }

    buscarPerfil() {
        if (this.documentoControl.invalid) return;

        const doc = this.documentoControl.value!;
        this.perfilService.getPerfilByDocumento(doc).subscribe((perfiles) => {
            if (perfiles && perfiles.length > 0) {
                this.perfilEncontrado = perfiles[0];
            } else {
                this.perfilEncontrado = null;
                this.toastr.warning('Perfil no encontrado');
            }
        });
    }

    asociarIglesia() {
        if (!this.perfilEncontrado || !this.perfilEncontrado.id) return;

        if (!this.usuario.iglesia) {
            this.toastr.error('No tienes una iglesia asignada para asociar.');
            return;
        }

        this.perfilService.updateIglesia(this.perfilEncontrado.id, this.usuario.iglesia)
            .then(() => {
                this.toastr.success('Perfil asociado correctamente');
                this.dialogRef.close(true);
            })
            .catch((error) => {
                this.toastr.error('Error al asociar el perfil');
                console.error(error);
            });
    }

    onNoClick(): void {
        this.dialogRef.close(false);
    }
}
