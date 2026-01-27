import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { BaseModel } from '../../../../models/base/base.model';
import { TestigoAsociadoModel } from '../../../../models/testigo-asociado/testigo-asociado.model';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { TestigoAsociadoService } from '../../../shared/services/testigo-asociado/testigo-asociado.service';
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';
import { InputTextComponent } from '../../../shared/components/atoms/input-text/input-text.component';
import { TitleComponent } from '../../../shared/components/atoms/title/title.component';
import { InputSelectComponent } from '../../../shared/components/atoms/input-select/input-select.component';
import { PuestoVotacionService } from '../../../shared/services/puesto-votacion/puesto-votacion.service';
import { PerfilService } from '../../../shared/services/perfil/perfil.service';

@Component({
    selector: 'app-gestion-testigos',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        InputTextComponent,
        ButtonComponent,
        TitleComponent,
        MatIconModule,
        InputSelectComponent,
    ],
    templateUrl: './gestion-testigos.component.html',
})
export class GestionTestigosComponent implements OnInit {
    form!: FormGroup;
    testigos$: Observable<BaseModel<TestigoAsociadoModel>[]>;
    loading: boolean = false;
    puestosVotacion: any[] = [];
    iglesiaId: string = '';

    constructor(
        private readonly fb: FormBuilder,
        private readonly testigoAsociadoService: TestigoAsociadoService,
        private readonly auth: AuthService,
        private readonly toast: ToastrService,
        private readonly puestoVotacionService: PuestoVotacionService,
        private readonly perfilService: PerfilService
    ) {
        this.testigos$ = this.testigoAsociadoService.getTestigosByCoordinador(
            this.auth.uidUser()
        );

        this.form = this.fb.group({
            nombres: ['', Validators.required],
            apellidos: ['', Validators.required],
            celular: [
                '',
                [
                    Validators.required,
                    Validators.pattern('^[0-9]*$'),
                    Validators.minLength(10),
                    Validators.maxLength(10),
                ],
            ],
            puestoVotacion: ['', Validators.required], // Store ID here
            mesa: ['', Validators.required],
        });
    }

    async ngOnInit() {
        try {
            const user = await this.perfilService.getMiPerfil(this.auth.uidUser());
            if (user && user.iglesia) {
                this.iglesiaId = user.iglesia;
                this.cargarPuestosVotacion();
            }
        } catch (error) {
            console.error('Error loading user profile', error);
        }
    }

    cargarPuestosVotacion() {
        this.puestoVotacionService.getPuestosByIglesia(this.iglesiaId).subscribe(puestos => {
            this.puestosVotacion = puestos.map(p => ({
                value: p.id,
                label: p.data.nombre // Using correct property based on standard model usage
            }));
        });
    }


    async onSubmit() {
        if (this.form.invalid) return;

        this.loading = true;
        const rawValue = this.form.getRawValue();

        const selectedPuesto = this.puestosVotacion.find(p => p.value === rawValue.puestoVotacion);
        const puestoName = selectedPuesto ? selectedPuesto.label : rawValue.puestoVotacion;


        const newTestigo: BaseModel<TestigoAsociadoModel> = {
            data: {
                nombres: rawValue.nombres,
                apellidos: rawValue.apellidos,
                celular: rawValue.celular,
                puestoVotacion: puestoName,
                mesa: rawValue.mesa,
                coordinadorId: this.auth.uidUser(),
            },
            fechaCreacion: new Date().toISOString(),
            creadoPor: this.auth.uidUser(),
        };

        try {
            await this.testigoAsociadoService.crearTestigoAsociado(newTestigo);
            this.toast.success('Testigo agregado correctamente');
            this.form.reset();
        } catch (error) {
            console.error(error);
            this.toast.error('Error al agregar testigo');
        } finally {
            this.loading = false;
        }
    }

    async deleteTestigo(id: string) {
        // Optional: Add confirmation dialog
        try {
            await this.testigoAsociadoService.deleteTestigoAsociado(id);
            this.toast.success('Testigo eliminado');
        } catch (error) {
            this.toast.error('Error al eliminar testigo');
        }
    }
}
