import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TitleComponent } from '../../../../shared/components/atoms/title/title.component';
import { ContainerGridComponent } from '../../../../shared/components/atoms/container-grid/container-grid.component';
import { ToastrService } from 'ngx-toastr';
import { LugaresService } from '../../../../shared/services/lugares/lugares.service';
import { BaseModel } from '../../../../../models/base/base.model';
import { LugarVotacionModel } from '../../../../../models/lider/lider.model';
import { CardContactoComponent } from '../../../../shared/components/organism/card-contact/card-contacto.component';
import { SpinnerComponent } from '../../../../shared/components/modules/spinner/spinner.component';
import { ContainerSearchComponent } from '../../../../shared/components/modules/container-search/container-search.component';
import { ButtonComponent } from '../../../../shared/components/atoms/button/button.component';
import * as XLSX from 'xlsx';
import { ReferidoModel } from '../../../../../models/referidos/referido.model';
import { ReferidoService } from '../../../../shared/services/referido/referido.service';

@Component({
  selector: 'app-lista-referidos',
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
  templateUrl: './lista-referidos.component.html',
})
export class ListaReridosComponent implements OnInit {
  referidos: BaseModel<ReferidoModel>[] = [];
  data: BaseModel<ReferidoModel>[] = [];
  spinner: boolean = true;


  constructor(
    private referidoService: ReferidoService,
    private toast: ToastrService
  ) {

  }

  ngOnInit(): void {
    this.getReferidos();
  }

  getReferidos(){
    this.referidoService.getReferidos().subscribe({
      next: (data) => {
        this.referidos = data;
        this.spinner = false;
      },
      error: (error) => {
        console.error(error);
        this.spinner = false;
      },
    });
  }

  onSearch(data: BaseModel<ReferidoModel>[]) {
    this.data = data

  }

  descargar (referidos: BaseModel<ReferidoModel>[]) {
    const datos = this.transformarDatos(referidos);
    const libro = XLSX.utils.book_new();
    const hoja = XLSX.utils.aoa_to_sheet(datos);
    XLSX.utils.book_append_sheet(libro, hoja, 'Referidos');
    XLSX.writeFile(libro, 'referidos.xlsx');
  }

  transformarDatos(referidos: BaseModel<ReferidoModel>[]): any[][] {
    const datos: any[][] = [];

      // Encabezados
    datos.push([
      'Departamento',
      'Municipio',
      'Iglesia',
      'Horario',
      'Documento',
      'Nombres',
      'Comuna',
      'Barrio',
      'Departamento de votación',
      'Municipio de votación',
      'Lugar de votación',
      'Mesa',
      'Líder',
    ]);

    referidos.forEach(referido => {
      const referidoData = referido.data;
      const lugarVotacion = referidoData.lugarVotacion || {} as LugarVotacionModel; // Manejo de lugarVotacion opcional

      // ROWS
      datos.push([
        referidoData.departamento.split('-')[1],
        referidoData.municipio.split('-')[1],
        referidoData.iglesia.split('-')[0],
        referidoData.iglesia.split('-')[1],
        referidoData.documento,
        referidoData.nombres + ' ' + referidoData.apellidos ,
        referidoData.comuna,
        referidoData.barrio,
        lugarVotacion.departamento.split('-')[1],
        lugarVotacion.municipio.split('-')[1],
        lugarVotacion.lugar,
        lugarVotacion.mesa,
        referidoData.referidoPor
      ]);
    });


    return datos;
  }



  onFileChange(event: any): void {
    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) {
      this.toast.error('Solo se puede cargar un archivo a la vez');
      return;
    }

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      this.processExcelData(data as any[][]);
    };
    reader.readAsBinaryString(target.files[0]);
  }

  processExcelData(data: any[][]): void {
    // Aquí puedes manipular los datos cargados del archivo Excel
    console.log(data);
    // Ejemplo: convertir los datos a un formato específico
    const usuarios = data.slice(1).map(row => ({
      departamento: '26-' + row[0],
      municipio: '897-' + row[1],
      iglesia: row[2] + '-' + row[3],
      documento: row[4],
      nombres: row[5],
      apellidos: '',
      comuna: row[5],
      barrio: row[6],
      direccion: row[7],
      celular: row[8],
      email: row[9],
    }));
    console.log(usuarios);
  }






}
