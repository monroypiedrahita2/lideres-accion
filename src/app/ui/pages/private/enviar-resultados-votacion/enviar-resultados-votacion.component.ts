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
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CuentavotosService } from '../../../shared/services/cuentavotos/cuentavotos.service';
import { TestigoService } from '../../../shared/services/testigo/testigo.service';
import { InputTextComponent } from '../../../shared/components/atoms/input-text/input-text.component';
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';
import { CuentavotosModel } from '../../../../models/cuentavotos/cuentavotos.model';

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
        MatSnackBarModule,
        InputTextComponent,
        ButtonComponent,
    ],
    templateUrl: './enviar-resultados-votacion.component.html',
    styleUrls: ['./enviar-resultados-votacion.component.scss'],
})
export class EnviarResultadosVotacionComponent {
    form: FormGroup;
    testigoForm: FormGroup;
    testigoEncontrado: any = null;
    loading = false;
    envioExitoso = false;

    private fb = inject(FormBuilder);
    private cuentavotosService = inject(CuentavotosService);
    private testigoService = inject(TestigoService);
    private snackBar = inject(MatSnackBar);
    private router = inject(Router);

    constructor() {
        this.testigoForm = this.fb.group({
            documento: ['', [Validators.required]],
        });

        this.form = this.fb.group({
            senado: ['', [Validators.required, Validators.min(0)]],
            camara: ['', [Validators.required, Validators.min(0)]],
        });
    }

    async buscarTestigo() {
        if (this.testigoForm.invalid) {
            this.testigoForm.markAllAsTouched();
            return;
        }

        this.loading = true;
        const documento = this.testigoForm.get('documento')?.value;

        try {
            const testigo = await this.testigoService.getTestigoByDocument(documento);
            if (testigo) {
                if (!testigo.data.puestodevotacion || !testigo.data.mesadevotacion) {
                    this.snackBar.open(
                        'El testigo no tiene puesto o mesa de votación asignados.',
                        'Cerrar',
                        { duration: 5000 }
                    );
                    this.testigoEncontrado = null;
                } else {
                    this.testigoEncontrado = testigo;
                    this.snackBar.open('Testigo encontrado.', 'Cerrar', {
                        duration: 3000,
                    });
                }
            }
        } catch (error) {
            this.snackBar.open(
                'Testigo no encontrado o error al buscar.',
                'Cerrar',
                { duration: 5000 }
            );
            this.testigoEncontrado = null;
        } finally {
            this.loading = false;
        }
    }

    async enviarResultados() {
        if (this.form.invalid || !this.testigoEncontrado) {
            this.form.markAllAsTouched();
            return;
        }

        this.loading = true;
        try {
            const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
            const now = new Date().toISOString();

            const votosData: CuentavotosModel = {
                reportadoPor: this.testigoEncontrado.id,
                puestoVotacion: this.testigoEncontrado.data.puestodevotacion,
                mesaVotacion: this.testigoEncontrado.data.mesadevotacion,
                senado: Number(this.form.get('senado')?.value),
                camara: Number(this.form.get('camara')?.value),
            };

            const resultados: any = {
                data: votosData,
                fechaCreacion: now,
                creadoPor: usuario.id || 'unknown',
            };

            await this.cuentavotosService.crearCuentavotos(resultados);

            this.envioExitoso = true;
            this.snackBar.open('Resultados enviados exitosamente.', 'Cerrar', {
                duration: 5000,
            });

            this.resetForm();
        } catch (error) {
            console.error(error);
            this.snackBar.open('Error al enviar los resultados.', 'Cerrar', {
                duration: 5000,
            });
        } finally {
            this.loading = false;
        }
    }

    resetForm() {
        this.form.reset();
        this.testigoForm.reset();
        this.testigoEncontrado = null;
        this.envioExitoso = false;
    }

    cancelar() {
        this.router.navigate(['/private/home']);
    }
}
