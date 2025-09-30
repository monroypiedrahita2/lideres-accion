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
import { PersonInfoComponent } from '../../../shared/components/modules/person-info/person-info.component';
import { Router } from '@angular/router';
import { PerfilModel } from '../../../../models/perfil/perfil.model';
import { ConfirmActionComponent } from '../../../shared/components/modules/modal/confirm-action.component';

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
    PersonInfoComponent,
    ConfirmActionComponent
  ],
  templateUrl: './testigos.component.html',
})
export class TestigosComponent implements OnInit {
  form!: FormGroup;
  referido: BaseModel<ReferidoModel> | null = null;
  showModal: boolean = false;
  dataModal: { name: string; id: string } = { name: '', id: '' };
  usuario: PerfilModel = JSON.parse(localStorage.getItem('usuario') || '{}');
  referidoSelected: BaseModel<ReferidoModel> | null = null;

  private avanceTimeout: any;
  loading: boolean = false;
  noReferido: boolean = false;
  testigos: BaseModel<ReferidoModel>[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly referidoService: ReferidoService,
    private readonly toast: ToastrService,
    private readonly router: Router
  ) {
    this.form = this.fb.group({
      documento: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
    });
  }

  ngOnInit(): void {
    this.form.get('documento')?.valueChanges.subscribe((value) => {
      this.selectDocument(value);
    });
    this.getTestigos()
  }

  getTestigos() {
    this.referidoService
      .getTestigos(this.usuario.iglesia!).subscribe({
        next: (res: BaseModel<ReferidoModel>[]) => {
          this.testigos = res;
        },
      })
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
    } catch (error) {
      console.error(error);
      this.toast.error('Error al actualizar el testigo. Intente nuevamente.');
    }
  }

  openModal(data: { name: string; id: string }) {
    this.showModal = true;
    this.dataModal = data;
    return true;
  }

  edit(referido: BaseModel<ReferidoModel>) {
    this.router.navigate(['private/editar-referido', referido.id]);
  }

 async quitarTestigo(referido: BaseModel<ReferidoModel>) {
      const data: BaseModel<ReferidoModel> = {
      ...referido!,
      data: {
        ...referido!.data,
        testigo: {
          ...referido!.data.testigo,
          quiereApoyar: false,
        },
      },
    };

    try {
      await this.referidoService.updateReferido(
        referido.id!,
        data
      );
      this.toast.success('Testigo agregado correctamente');
    } catch (error) {
      console.error(error);
      this.toast.error('Error al actualizar el testigo. Intente nuevamente.');
    }


  }

  clear() {
    this.form.reset();
  }

}
