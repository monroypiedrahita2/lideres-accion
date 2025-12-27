
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

    constructor(
        private fb: FormBuilder,
        private comunaService: ComunaService
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
    }

    loadBarrios() {
        this.comunaService.getComunas().pipe(
            map((comunas: BaseModel<ComunaModel>[]) => {
                return comunas.map(c => {
                    const barrio = c.data.barrio ? (c.data.barrio.includes('-') ? c.data.barrio.split('-')[1] : c.data.barrio) : 'Sin Barrio';
                    const municipio = c.data.municipio ? (c.data.municipio.includes('-') ? c.data.municipio.split('-')[1] : c.data.municipio) : 'Sin Municipio';
                    return {
                        label: `${barrio} - ${municipio}`,
                        value: c.id
                    } as SelectOption;
                });
            })
        ).subscribe(options => {
            this.barrioOptions = options;
        });
    }

    submit() {
        if (this.form.valid) {
            console.log('Form Data:', this.form.value);
            // Here you would call the service to save the data
            // e.g., this.casaApoyoService.create(this.form.value)...
        } else {
            this.form.markAllAsTouched();
        }
    }
}
