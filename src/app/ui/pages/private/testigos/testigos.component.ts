import { BaseModel } from '../../../../models/base/base.model';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TitleComponent } from '../../../shared/components/atoms/title/title.component';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { ToastrService } from 'ngx-toastr';
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';

import { MatIconModule } from '@angular/material/icon';
import { InputTextComponent } from '../../../shared/components/atoms/input-text/input-text.component';
import { ReferidoService } from '../../../shared/services/referido/referido.service';
import { ReferidoModel } from '../../../../models/referido/referido.model';
import { PrivateRoutingModule } from '../private-routing.module';

@Component({
  selector: 'app-testigos',
  standalone: true,
  imports: [
    CommonModule,
    InputTextComponent,
    TitleComponent,
    ReactiveFormsModule,
    CommonModule,
    ButtonComponent,
    MatIconModule,
    PrivateRoutingModule,
  ],
  templateUrl: './testigos.component.html',
})
export class TestigosComponent implements OnInit {
  form!: FormGroup;
  referido: BaseModel<ReferidoModel> | null = null;

  private avanceTimeout: any;
  loading: boolean = false;
  noReferido: boolean = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly referidoService: ReferidoService,
    private readonly toast: ToastrService
  ) {
    this.form = this.fb.group({
      documento: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
    });
  }

  ngOnInit(): void {
    this.form.get('documento')?.valueChanges.subscribe((value) => {
      this.selectDocument(value);
    });
  }

  selectDocument(value: string) {
    if (this.avanceTimeout) {
      clearTimeout(this.avanceTimeout);
    }
    this.avanceTimeout = setTimeout(() => {
      this.referidoService
        .getReferido(value)
        .then((res: BaseModel<ReferidoModel>) => {
          if (res) {
            this.referido = res;
          }
        });
    }, 500);
  }

  async crearTestigo() {
    this.loading = true;
    const data: BaseModel<ReferidoModel> = {
      ...this.referido!,
      data: {
        ...this.referido!.data,
        testigo: {
          ...this.referido!.data.testigo,
          quiereApoyar: true,
        },
      },
    };

    try {
      await this.referidoService.updateReferido(
        this.form.value.documento,
        data
      );
      this.toast.success('Testigo agregado correctamente');
      this.loading = false;
      this.clear(); // Clear form after success
    } catch (error) {
      console.error(error);
      this.toast.error('Error al actualizar el testigo. Intente nuevamente.');
      this.loading = false;
    }
  }

  clear() {
    this.form.reset();
    this.referido = null;
  }
}
