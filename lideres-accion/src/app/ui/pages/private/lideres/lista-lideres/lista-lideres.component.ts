import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputSelectComponent } from '../../../../shared/components/atoms/input-select/input-select.component';
import { CommonModule, Location } from '@angular/common';
import { InputTextComponent } from '../../../../shared/components/atoms/input-text/input-text.component';
import { TitleComponent } from '../../../../shared/components/atoms/title/title.component';
import { SubTitleComponent } from '../../../../shared/components/atoms/sub-title/sub-title.component';
import { ContainerGridComponent } from '../../../../shared/components/atoms/container-grid/container-grid.component';
import { PerfilService } from '../../../../shared/services/perfil/perfil.service';
import { AuthService } from '../../../../shared/services/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { IglesiaService } from '../../../../shared/services/iglesia/iglesia.service';
import { LugaresService } from '../../../../shared/services/lugares/lugares.service';
import { ComunaService } from '../../../../shared/services/comuna/comuna.service';
import { SelectOptionModel } from '../../../../../models/base/select-options.model';
import { FILTER_CONST } from '../../../../shared/const/filter.const';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-lista-lideres',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputSelectComponent,
    InputTextComponent,
    TitleComponent,
    SubTitleComponent,
    ContainerGridComponent

  ],
  providers: [LugaresService],
  templateUrl: './lista-lideres.component.html',
})
export class ListaLideresComponent implements OnInit {
  form!: FormGroup;
  busqueda: SelectOptionModel<string>[] = FILTER_CONST;
  atributo: SelectOptionModel<any>[] = []

  departamentos: SelectOptionModel<string>[] = [];
  municipios: SelectOptionModel<string>[] = [];
  iglesias: SelectOptionModel<string | undefined>[] = [];
  comunas: SelectOptionModel<string | undefined>[] = [];

  constructor (
    private fb: FormBuilder,
    private perfilService: PerfilService,
    private location: Location,
    private auth: AuthService,
    private toast: ToastrService,
    private iglesiasService: IglesiaService,
    private lugarService: LugaresService,
    private comunaService: ComunaService
  ) {
    this.form = this.fb.group({
      busqueda: [''],
      atributo: ['']
    })
  }

  ngOnInit(): void {
    
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
        console.error(error);
        this.toast.error('Error al cargar los departamentos');
        this.location.back();
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
        this.toast.error('Error al cargar los municipios');
        this.location.back();
      }
    }


}
