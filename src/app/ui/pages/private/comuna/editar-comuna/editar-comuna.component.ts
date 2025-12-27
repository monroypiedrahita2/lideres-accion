import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SelectOptionModel } from '../../../../../models/base/select-options.model';
import { BaseModel } from '../../../../../models/base/base.model';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LugaresService } from '../../../../shared/services/lugares/lugares.service';
import { ToastrService } from 'ngx-toastr';
import { lastValueFrom } from 'rxjs';
import { CommonModule, Location } from '@angular/common';
import { AuthService } from '../../../../shared/services/auth/auth.service';
import { ComunaService } from '../../../../shared/services/comuna/comuna.service';
import { InputTextComponent } from '../../../../shared/components/atoms/input-text/input-text.component';
import { ContainerGridComponent } from '../../../../shared/components/atoms/container-grid/container-grid.component';
import { InputSelectComponent } from '../../../../shared/components/atoms/input-select/input-select.component';
import { HttpClientModule } from '@angular/common/http';
import { TitleComponent } from '../../../../shared/components/atoms/title/title.component';
import { ButtonsFormComponent } from '../../../../shared/components/modules/buttons-form/buttons-form.component';
import { ComunaModel } from '../../../../../models/comuna/comuna.model';
import { SkeletonComponent } from '../../../../shared/components/organism/skeleton/skeleton.component';

@Component({
  selector: 'app-editar-comuna',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    ContainerGridComponent,
    InputTextComponent,
    InputSelectComponent,
    HttpClientModule,
    TitleComponent,
    ButtonsFormComponent,
    ContainerGridComponent,
    SkeletonComponent,
  ],
  providers: [LugaresService],
  templateUrl: './editar-comuna.component.html',
})
export class EditarComunaComponent implements OnInit {
  form!: FormGroup;
  departamentos: SelectOptionModel<string>[] = [];
  municipios: SelectOptionModel<number>[] = [];
  loading: boolean = false;
  enableSkeleton: boolean = true;
  comunaId: string = '';
  comunaData: any = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly lugarService: LugaresService,
    private readonly toast: ToastrService,
    private readonly location: Location,
    private readonly auth: AuthService,
    private readonly comunaService: ComunaService,
    private readonly route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      departamento: ['', Validators.required],
      municipio: ['', Validators.required],
      comuna: ['', Validators.required],
      barrio: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.comunaId = this.route.snapshot.paramMap.get('id') || '';
    if (this.comunaId) {
      this.loadComuna();
    } else {
      this.toast.error('ID de comuna no encontrado');
      this.location.back();
    }

    this.form
      .get('departamento')
      ?.valueChanges.subscribe(async (departamento) => {
        if (departamento) {
          this.form.get('municipio')?.enable();
          await this.getMunicipios(departamento.split('-')[0]);
        } else {
          this.form.get('municipio')?.disable();
          this.municipios = [];
          this.form.patchValue({ municipio: '' });
        }
      });
  }

  async loadComuna() {
    try {
      this.comunaData = await this.comunaService.getComuna(this.comunaId);
      await this.initComponent();
      await this.populateForm();
    } catch (error) {
      console.error(error);
      this.toast.error('Error al cargar la comuna');
      this.location.back();
    }
  }

  async initComponent() {
    await this.getDepartamentos();
    this.form.get('municipio')?.disable();
    this.enableSkeleton = false;
  }

  async getDepartamentos() {
    try {
      const response = await lastValueFrom(
        this.lugarService.getDepartamentos()
      );
      this.departamentos = response.map((item: any) => ({
        label: item.name,
        value: item.id + '-' + item.name,
      }));
    } catch (error) {
      console.error('Error al cargar los departamentos:', error);
      this.toast.error('Error al cargar los departamentos');
    }
  }

  async getMunicipios(departamento_id: string) {
    try {
      const response = await lastValueFrom(
        this.lugarService.getMunicipios(departamento_id)
      );

      this.municipios = response.map((item: any) => ({
        label: item.name,
        value: item.id + '-' + item.name,
      }));
    } catch (error) {
      console.error('Error al cargar los municipios:', error);
      this.toast.error('Error al cargar los municipios');
    }
  }

  async populateForm() {
    if (this.comunaData) {
      this.form.patchValue({
        departamento: this.comunaData.data.departamento,
        comuna: this.comunaData.data.comuna,
        barrio: this.comunaData.data.barrio,
      });
      // Enable municipio if departamento is set
      if (this.comunaData.data.departamento) {
        this.form.get('municipio')?.enable();
        await this.getMunicipios(this.comunaData.data.departamento.split('-')[0]);
        this.form.patchValue({
          municipio: this.comunaData.data.municipio,
        });
      }
    }
  }

  async onSubmit() {
    this.loading = true;
    try {
      const updatedData: BaseModel<ComunaModel> = {
        ...this.comunaData,
        data: {
          ...this.comunaData.data,
          departamento: this.form.value.departamento,
          municipio: this.form.value.municipio,
          comuna: this.form.value.comuna,
          barrio: this.form.value.barrio,
        },
        fechaModificacion: new Date().toISOString(),
        modificadoPor: this.auth.uidUser(),
      };

      await this.comunaService.updateComuna(this.comunaId, updatedData);
      this.toast.success('Comuna actualizada correctamente');
      this.location.back();
    } catch (error) {
      console.error(error);
      this.toast.error('Error al actualizar la comuna. Intente nuevamente.');
    } finally {
      this.loading = false;
    }
  }
}
