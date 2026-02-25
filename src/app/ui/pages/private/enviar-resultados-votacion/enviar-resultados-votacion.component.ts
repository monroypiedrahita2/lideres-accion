import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    ReactiveFormsModule,
    FormBuilder,
    FormGroup,
    Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CuentavotosService } from '../../../shared/services/cuentavotos/cuentavotos.service';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { InputTextComponent } from '../../../shared/components/atoms/input-text/input-text.component';
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';
import { CuentavotosModel } from '../../../../models/cuentavotos/cuentavotos.model';
import { DialogNotificationComponent } from '../../../shared/dialogs/dialog-notification/dialog-nofication.component';
import { DialogNotificationModel } from '../../../../models/base/dialog-notification.model';

@Component({
    selector: 'app-enviar-resultados-votacion',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        MatDialogModule,
        InputTextComponent,
        ButtonComponent,
    ],
    templateUrl: './enviar-resultados-votacion.component.html',
    styleUrls: ['./enviar-resultados-votacion.component.scss'],
})
export class EnviarResultadosVotacionComponent {
    form: FormGroup;
    testigoEncontrado: any = null;
    loading = false;
    envioExitoso = false;
    editingMesa = false;

    private fb = inject(FormBuilder);
    private cuentavotosService = inject(CuentavotosService);
    private authService = inject(AuthService);
    private dialog = inject(MatDialog);
    private router = inject(Router);

    constructor() {
        this.form = this.fb.group({
            senado: ['', [Validators.required, Validators.min(0)]],
            camara: ['', [Validators.required, Validators.min(0)]],
            mesa: [{ value: '', disabled: true }, [Validators.required]]
        });
    }

    async ngOnInit() {
        this.loading = true;
        try {
            const uid = this.authService.uidUser();
            if (!uid) {
                this.showNotification('error', 'Error', 'Usuario no identificado.');
                this.router.navigate(['/public/login']);
                return;
            }

       

        } catch (error) {
            console.error('Error fetching witness:', error);
            this.showNotification('error', 'Error', 'Actualmente no estas aprobado como testigo.');
        } finally {
            this.loading = false;
        }
    }

    toggleEditMesa() {
        this.editingMesa = !this.editingMesa;
        if (this.editingMesa) {
            this.form.get('mesa')?.enable();
        } else {
            this.form.get('mesa')?.disable();
            // Optionally reset to original value if cancelled, currently it keeps the edit
        }
    }

    async enviarResultados() {
        if (this.form.invalid || !this.testigoEncontrado) {
            this.form.markAllAsTouched();
            return;
        }

        this.loading = true;
        try {
            const now = new Date().toISOString();
            const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

            // Get mesa value, using getRawValue because it might be disabled
            const mesaValue = this.form.get('mesa')?.value;

            const votosData: CuentavotosModel = {
                puestoVotacionId: this.testigoEncontrado.data.puestodevotacion,
                mesaVotacion: mesaValue,
                senado: Number(this.form.get('senado')?.value),
                camara: Number(this.form.get('camara')?.value),
            };

            const resultados: any = {
                data: votosData,
                fechaCreacion: now,
                creadoPor: usuario.id || this.authService.uidUser(),
            };

            await this.cuentavotosService.crearCuentavotos(resultados);

            this.envioExitoso = true;
            this.showNotification('success', 'Éxito', 'Resultados enviados exitosamente.');

            this.resetForm();
        } catch (error) {
            console.error(error);
            this.showNotification('error', 'Error', 'Error al enviar los resultados.');
        } finally {
            this.loading = false;
        }
    }

    resetForm() {
        this.envioExitoso = false;
        this.form.reset();
        // Reset local editing state
        this.editingMesa = false;
        this.form.get('mesa')?.disable();

        // Restore original mesa value if needed or keep it empty until reload
        if (this.testigoEncontrado) {
            this.form.patchValue({
                mesa: this.testigoEncontrado.data.mesadevotacion
            });
        }
    }

    cancelar() {
        this.router.navigate(['/private/home']);
    }

    private showNotification(type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) {
        const data: DialogNotificationModel = {
            type,
            title,
            message,
            bottons: 'one'
        };
        this.dialog.open(DialogNotificationComponent, {
            data,
            width: '400px',
            panelClass: 'dialog-notification'
        });
    }
}
