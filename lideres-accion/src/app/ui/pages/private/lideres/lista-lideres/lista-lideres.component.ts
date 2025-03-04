import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TitleComponent } from '../../../../shared/components/atoms/title/title.component';
import { ContainerGridComponent } from '../../../../shared/components/atoms/container-grid/container-grid.component';
import { ToastrService } from 'ngx-toastr';
import { LugaresService } from '../../../../shared/services/lugares/lugares.service';
import { LiderService } from '../../../../shared/services/lider/lider.service';
import { BaseModel } from '../../../../../models/base/base.model';
import { LiderModel, LugarVotacionModel } from '../../../../../models/lider/lider.model';
import { CardContactoComponent } from '../../../../shared/components/organism/card-contact/card-contacto.component';
import { SpinnerComponent } from '../../../../shared/components/modules/spinner/spinner.component';
import { ContainerSearchComponent } from '../../../../shared/components/modules/container-search/container-search.component';
import { ButtonComponent } from '../../../../shared/components/atoms/button/button.component';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-lista-lideres',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TitleComponent,
    ContainerGridComponent,
    CardContactoComponent,
    ContainerGridComponent,
    SpinnerComponent,
    ContainerSearchComponent,
    ButtonComponent
  ],
  providers: [LugaresService],
  templateUrl: './lista-lideres.component.html',
})
export class ListaLideresComponent implements OnInit {
  lideres: BaseModel<LiderModel>[] = [];
  data: BaseModel<LiderModel>[] = [];
  spinner: boolean = true;


  constructor(
    private fb: FormBuilder,
    private liderService: LiderService,
    private toast: ToastrService
  ) {

  }

  ngOnInit(): void {
    this.getLideres();
  }

  getLideres(){
    this.liderService.getLideres().subscribe({
      next: (data) => {
        this.lideres = data;
        this.spinner = false;
      },
      error: (error) => {
        console.error(error);
        this.spinner = false;
      },
    });
  }

  onSearch(data: BaseModel<LiderModel>[]) {
    this.data = data

  }

  descargar (lideres: BaseModel<LiderModel>[]) {
    const datos = this.transformarDatos(lideres);
    const libro = XLSX.utils.book_new();
    const hoja = XLSX.utils.aoa_to_sheet(datos);
    XLSX.utils.book_append_sheet(libro, hoja, 'Líderes');
    XLSX.writeFile(libro, 'lideres.xlsx');
  }

  transformarDatos(lideres: BaseModel<LiderModel>[]): any[][] {
    const datos: any[][] = [];

      // Encabezados
    datos.push([
      'Departamento',
      'Municipio',
      'Iglesia',
      'Jornada',
      'Documento',
      'Nombres',
      'Barrio',
      'Departamento de votación',
      'Municipio de votación',
      'Lugar de votación',
      'Mesa',
      'Total referidos',
    ]);

    lideres.forEach(lider => {
      const liderData = lider.data;
      const lugarVotacion = liderData.lugarVotacion || {} as LugarVotacionModel; // Manejo de lugarVotacion opcional

      // ROWS
      datos.push([
        liderData.departamento.split('-')[1],
        liderData.municipio.split('-')[1],
        liderData.iglesia.split('-')[0],
        liderData.iglesia.split('-')[1],
        liderData.documento,
        liderData.nombres + '' + liderData.apellidos ,
        liderData.barrio,
        lugarVotacion.departamento.split('-')[1],
        lugarVotacion.municipio.split('-')[1],
        lugarVotacion.lugar,
        lugarVotacion.mesa,
        '0',
      ]);
    });


    return datos;
  }






}
