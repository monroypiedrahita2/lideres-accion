
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ComunaService } from '../../../shared/services/comuna/comuna.service';
import { InputSelectComponent, SelectOption } from '../../../shared/components/atoms/input-select/input-select.component';
import { InputTextComponent } from '../../../shared/components/atoms/input-text/input-text.component';
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';
import { TitleComponent } from '../../../shared/components/atoms/title/title.component';
import { map } from 'rxjs/operators';
import { BaseModel } from '../../../../models/base/base.model';
import { ComunaModel } from '../../../../models/comuna/comuna.model';
import { CasaApoyoService } from '../../../shared/services/casa-apoyo/casa-apoyo.service';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { CasaApoyoModel } from '../../../../models/casa-apoyo/casa-apoyo.model';
import { DialogNotificationComponent } from '../../../shared/dialogs/dialog-notification/dialog-nofication.component';
import { Router } from '@angular/router';
import { PerfilModel } from '../../../../models/perfil/perfil.model';

@Component({
    selector: 'app-mi-casa-de-apoyo',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        InputSelectComponent,
        InputTextComponent,
        ButtonComponent,
        TitleComponent
    ],
    templateUrl: './mi-casa-de-apoyo.component.html',
    styleUrls: ['./mi-casa-de-apoyo.component.scss']
})
export class MiCasaDeApoyoComponent implements OnInit {

    form: FormGroup;
    barrioOptions: SelectOption[] = [];
    existingCasaId: string | null = null;
    accion: 'Crear' | 'Editar' = 'Crear';
    usuario: PerfilModel = localStorage.getItem('usuario') ? JSON.parse(localStorage.getItem('usuario') || '') : {} as PerfilModel;

    constructor(
        private fb: FormBuilder,
        private comunaService: ComunaService,
        private casaApoyoService: CasaApoyoService,
        private authService: AuthService,
        private dialog: MatDialog,
        private router: Router
    ) {
        this.form = this.fb.group({
            barrioId: ['', [Validators.required]],
            direccion: ['', [Validators.required]],
            nombreHabitante: ['', [Validators.required]],
            telefonoHabitante: ['', [Validators.required, Validators.pattern('^[0-9]*$')]]
        });
    }

    ngOnInit(): void {
        this.loadBarrios();
        this.loadExistingCasa();
    }

    loadBarrios() {
        this.comunaService.getComunas().pipe(
            map((comunas: BaseModel<ComunaModel>[]) => {
                return comunas.map(c => {
                    const barrio = c.data.barrio ? (c.data.barrio.includes('-') ? c.data.barrio.split('-')[1] : c.data.barrio) : 'Sin Barrio';
                    const municipio = c.data.municipio ? (c.data.municipio.includes('-') ? c.data.municipio.split('-')[1] : c.data.municipio) : 'Sin Municipio';
                    return {
                        label: `${barrio} - ${municipio}`,
                        value: c.id,
                        // Store extra data in a way we can retrieve if needed, 
                        // but InputSelect only handles label/value. 
                        // We will look up by ID later.
                    } as SelectOption;
                });
            })
        ).subscribe(options => {
            this.barrioOptions = options;
        });
    }

    loadExistingCasa() {
        const uid = this.authService.uidUser();
        // If user is not logged in properly, might check here.
        if (!uid) return;

        this.casaApoyoService.getCasasApoyoByResponsable(uid).subscribe(casas => {
            if (casas && casas.length > 0) {
                const casa = casas[0];
                this.existingCasaId = casa.id || null;
                this.accion = 'Editar';

                // Patch form
                this.form.patchValue({
                    barrioId: casa.data.barrioId,
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

        const barrioId = this.form.value.barrioId;
        // Need to find barrio name and municipio from options or service? 
        // options only has label/value. 
        // I need to find the option label to extract names, or fetch the comuna.
        // Option label is "Barrio - Municipio".

        const selectedOption = this.barrioOptions.find(o => o.value === barrioId);
        let barrioName = '';
        let municipioName = '';

        if (selectedOption) {
            const parts = selectedOption.label.split(' - ');
            if (parts.length >= 2) {
                barrioName = parts[0];
                municipioName = parts[1];
            } else {
                barrioName = selectedOption.label;
            }
        }

        const casaData: CasaApoyoModel = {
            barrioId: barrioId,
            barrio: barrioName,
            municipio: municipioName,
            direccion: this.form.value.direccion,
            nombreHabitante: this.form.value.nombreHabitante,
            telefonoHabitante: this.form.value.telefonoHabitante,
            responsableId: this.authService.uidUser(),
            responsableNombre: this.usuario.nombres,
            responsableApellido: this.usuario.apellidos,
            responsableTelefono: this.usuario.celular || '',
            iglesiaId: this.usuario.iglesia || null,
            aprobado: null,
            aprobadoPor: null
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
