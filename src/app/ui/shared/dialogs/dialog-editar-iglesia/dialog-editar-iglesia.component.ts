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
    departamentos: SelectOptionModel<string>[] = [];
    municipios: SelectOptionModel<string>[] = [];
    horarios: SelectOptionModel<string>[] = [
        { value: 'Externo', label: 'Externo' },
        { value: '7:00 AM', label: '7:00 AM' },
        { value: '5:00 PM', label: '5:00 PM' },
        { value: '6:30 PM', label: '6:30 PM' },
        { value: '7:00 PM', label: '7:00 PM' },
    ];
    loading: boolean = false;

    constructor(
        public dialogRef: MatDialogRef<DialogEditarIglesiaComponent>,
        @Inject(MAT_DIALOG_DATA) public data: BaseModel<IglesiaModel>,
        private fb: FormBuilder,
        private iglesiaService: IglesiaService,
        private lugaresService: LugaresService,
        private toastr: ToastrService
    ) {
        this.form = this.fb.group({
            nombre: ['', [Validators.required]],
            departamento: ['', Validators.required],
            municipio: ['', Validators.required],
            horario: ['', Validators.required],
        });
    }

    async ngOnInit() {
        await this.getDepartamentos();
        this.initForm();

        this.form.get('departamento')?.valueChanges.subscribe((departamento) => {
            if (departamento) {
                this.getMunicipios(departamento.split('-')[0]); // Assuming format "ID-NAME"
                this.form.get('municipio')?.enable();
            } else {
                this.municipios = [];
                this.form.get('municipio')?.disable();
            }
        });
    }

    initForm() {
        if (this.data && this.data.data) {
            const parts = this.data.data.nombre.split(' - ');
            const nombreReal = parts[0];
            const horarioReal = parts.length > 1 ? parts[1] : '';

            this.form.patchValue({
                nombre: nombreReal,
                horario: horarioReal,
                departamento: this.data.data.departamento,
            });

            // Load municipios for the current department and then set the value
            if (this.data.data.departamento) {
                const deptId = this.data.data.departamento.split('-')[0];
                this.getMunicipios(deptId).then(() => {
                    this.form.patchValue({
                        municipio: this.data.data.municipio
                    });
                });
            }
        }
    }

    async getDepartamentos() {
        try {
            const response = await lastValueFrom(this.lugaresService.getDepartamentos());
            this.departamentos = response.map((item: any) => ({
                label: item.name,
                value: item.id + '-' + item.name,
            }));
        } catch {
            this.toastr.error('Error al cargar los departamentos');
        }
    }

    async getMunicipios(departamento_id: string) {
        try {
            const response = await lastValueFrom(this.lugaresService.getMunicipios(departamento_id));
            this.municipios = response.map((item: any) => ({
                label: item.name,
                value: item.id + '-' + item.name,
            }));
        } catch {
            this.toastr.error('Error al cargar los municipios');
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
                    nombre: this.form.value.nombre + ' - ' + this.form.value.horario,
                    departamento: this.form.value.departamento,
                    municipio: this.form.value.municipio
                }
            };

            // Remove id from the object if it exists at the top level to avoid overwriting it in the document data if not intended,
            // although updateIglesia spreads ...iglesia which puts properties into the document.
            // Usually ID is not part of the data field but `BaseModel` might have it.
            // The service uses `updateDoc(docRef, { ...iglesia })`. 
            // If `iglesia` has `id`, it will be saved as a field. Verify if that's desired or if `id` is just for the query.
            // In `IglesiaService.getIglesias`, `idField: 'id'` places the ID in the object result.
            // It's safer to separate data to update.

            // Let's ensure we only send what matches IglesiaModel structure inside data, plus generic fields.

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
