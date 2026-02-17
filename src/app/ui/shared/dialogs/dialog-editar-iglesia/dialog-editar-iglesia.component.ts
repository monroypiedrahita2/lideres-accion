import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { InputTextComponent } from '../../components/atoms/input-text/input-text.component';
import { InputSelectComponent } from '../../components/atoms/input-select/input-select.component';
import { ButtonComponent } from '../../components/atoms/button/button.component';
import { IglesiaService } from '../../services/iglesia/iglesia.service';
import { LugaresService } from '../../services/lugares/lugares.service';
import { BaseModel } from '../../../../models/base/base.model';
import { IglesiaModel } from '../../../../models/iglesia/iglesia.model';
import { SelectOptionModel } from '../../../../models/base/select-options.model';
import { lastValueFrom } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import { MUNICIPIOS } from '../../const/municipios.const';

@Component({
    selector: 'app-dialog-editar-iglesia',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        InputTextComponent,
        InputSelectComponent,
        ButtonComponent,
        HttpClientModule
    ],
    providers: [LugaresService],
    templateUrl: './dialog-editar-iglesia.component.html',
})
export class DialogEditarIglesiaComponent implements OnInit {
    form!: FormGroup;
    municipios: SelectOptionModel<string>[] = MUNICIPIOS;
    loading: boolean = false;

    constructor(
        public dialogRef: MatDialogRef<DialogEditarIglesiaComponent>,
        @Inject(MAT_DIALOG_DATA) public data: BaseModel<IglesiaModel>,
        private fb: FormBuilder,
        private iglesiaService: IglesiaService,
        private toastr: ToastrService
    ) {
        this.form = this.fb.group({
            nombre: ['', [Validators.required]],
            municipio: ['', [Validators.required]],
        });
    }

    async ngOnInit() {
        this.initForm();
    }

    initForm() {
        if (this.data && this.data.data) {
            const parts = this.data.data.nombre.split(' - ');
            const nombreReal = parts[0];
            const horarioReal = parts.length > 1 ? parts[1] : '';

            this.form.patchValue({
                nombre: nombreReal,
                horario: horarioReal,
                municipio: this.data.data.municipio
            });
        }
    }

    async onSubmit() {
        if (this.form.invalid) return;
        this.loading = true;

        try {
            const updatedData: BaseModel<IglesiaModel> = {
                ...this.data,
                data: {
                    ...this.data.data,
                    nombre: this.form.value.nombre,
                    municipio: this.form.value.municipio
                }
            };

            if (this.data.id) {
                await this.iglesiaService.updateIglesia(this.data.id, updatedData);
                this.toastr.success('Iglesia actualizada correctamente');
                this.dialogRef.close(true);
            } else {
                this.toastr.error('Error: No se encontró el ID de la iglesia');
            }

        } catch (error) {
            console.error(error);
            this.toastr.error('Error al actualizar la iglesia');
        } finally {
            this.loading = false;
        }
    }

    onNoClick(): void {
        this.dialogRef.close(false);
    }
}
