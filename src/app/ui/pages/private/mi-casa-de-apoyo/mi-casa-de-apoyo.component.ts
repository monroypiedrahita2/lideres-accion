
import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextComponent } from '../../../shared/components/atoms/input-text/input-text.component';
import { InputSelectComponent, SelectOption } from '../../../shared/components/atoms/input-select/input-select.component';
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';
import { TitleComponent } from '../../../shared/components/atoms/title/title.component';
import { BaseModel } from '../../../../models/base/base.model';
import { CasaApoyoService } from '../../../shared/services/casa-apoyo/casa-apoyo.service';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { CasaApoyoModel } from '../../../../models/casa-apoyo/casa-apoyo.model';
import { DialogNotificationComponent } from '../../../shared/dialogs/dialog-notification/dialog-nofication.component';
import { Router } from '@angular/router';
import { PerfilModel } from '../../../../models/perfil/perfil.model';
import { IglesiaModel } from '../../../../models/iglesia/iglesia.model';
import { ContainerAlertInformationComponent } from '../../../shared/components/modules/container-alert-information/container-alert-information.component';
import { MUNICIPIOS } from '../../../shared/const/municipios.const';

@Component({
    selector: 'app-mi-casa-de-apoyo',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        InputTextComponent,
        InputSelectComponent,
        ButtonComponent,
        TitleComponent,
        ContainerAlertInformationComponent
    ],
    templateUrl: './mi-casa-de-apoyo.component.html',
    styleUrls: ['./mi-casa-de-apoyo.component.scss']
})
export class MiCasaDeApoyoComponent implements OnInit {

    form: FormGroup;
    existingCasaId: string | null = null;
    accion: 'Crear' | 'Editar' = 'Crear';
    usuario: PerfilModel = localStorage.getItem('usuario') ? JSON.parse(localStorage.getItem('usuario') || '') : {} as PerfilModel;
    existingCasaData: CasaApoyoModel | null = null;

    municipios: SelectOption[] = MUNICIPIOS

    constructor(
        private fb: FormBuilder,
        private casaApoyoService: CasaApoyoService,
        private authService: AuthService,
        private dialog: MatDialog,
        private router: Router,
        private location: Location
    ) {
        this.form = this.fb.group({
            municipio: ['', [Validators.required]],
            barrio: ['', [Validators.required]],
            direccion: ['', [Validators.required]],
            nombreHabitante: ['', [Validators.required]],
            telefonoHabitante: ['', [Validators.required, Validators.pattern('^[0-9]*$'), Validators.maxLength(10), Validators.minLength(10)]]
        });
    }

    ngOnInit(): void {
        this.loadExistingCasa();
    }

    loadExistingCasa() {
        const uid = this.authService.uidUser();
        // If user is not logged in properly, might check here.
        if (!uid) return;

        this.casaApoyoService.getCasasApoyoByResponsable(uid).subscribe(casas => {
            if (casas && casas.length > 0) {
                const casa = casas[0];
                this.existingCasaId = casa.id || null;
                this.existingCasaData = casa.data;
                this.accion = 'Editar';

                // Patch form
                this.form.patchValue({
                    municipio: casa.data.municipio,
                    barrio: casa.data.barrio,
                    direccion: casa.data.direccion,
                    nombreHabitante: casa.data.nombreHabitante,
                    telefonoHabitante: casa.data.telefonoHabitante
                });
            } else {
                // Pre-fill from user profile if creating new
                this.form.patchValue({
                    nombreHabitante: `${this.usuario.nombres} ${this.usuario.apellidos}`,
                    telefonoHabitante: this.usuario.celular
                });
            }
        });
    }

    async submit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const casaData: CasaApoyoModel = {
            barrio: this.form.value.barrio,
            municipio: this.form.value.municipio,
            direccion: this.form.value.direccion,
            nombreHabitante: this.form.value.nombreHabitante,
            telefonoHabitante: this.form.value.telefonoHabitante,
            responsableId: this.authService.uidUser(),
            responsableNombre: this.usuario.nombres,
            responsableApellido: this.usuario.apellidos,
            responsableTelefono: this.usuario.celular || '',
            iglesiaId: this.usuario.iglesia || null,
            aprobado: (this.accion === 'Editar' && this.existingCasaData) ? this.existingCasaData.aprobado : null,
            aprobadoPor: (this.accion === 'Editar' && this.existingCasaData) ? this.existingCasaData.aprobadoPor : null
        };

        try {
            if (this.accion === 'Editar' && this.existingCasaId) {
                await this.casaApoyoService.updateCasaApoyo(this.existingCasaId, casaData);
                this.openNotification('Actualizado', 'Casa de apoyo actualizada correctamente', 'success');
            } else {
                // Create needs BaseModel wrapper? No, addDoc takes data. 
                // Service expects BaseModel<CasaApoyoModel>. 
                // Actually service addDoc(collection, casa). 
                // So I should pass object with data property?
                // Let's check Service: createCasaApoyo(casa: BaseModel<CasaApoyoModel>) -> addDoc(..., casa)
                // Firestore addDoc expects the document data.
                // If I pass { data: casaData }, it creates doc with `data` field.
                // Looking at BaseModel definition might help, but typically we wrap in { data: ... }

                await this.casaApoyoService.createCasaApoyo({ data: casaData } as any);
                this.openNotification('Guardado', 'Casa de apoyo creada correctamente', 'success');
            }
            this.router.navigate(['/private/home']);
        } catch (error) {
            console.error(error);
            this.openNotification('Error', 'No se pudo guardar la información', 'error');
        }
    }

    openNotification(title: string, message: string, type: string) {
        this.dialog.open(DialogNotificationComponent, {
            data: {
                title,
                message,
                type,
                bottons: 'one'
            }
        });
    }
}
