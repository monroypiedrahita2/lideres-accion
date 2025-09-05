import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TitleComponent } from '../../../../shared/components/atoms/title/title.component';
import { ContainerGridComponent } from '../../../../shared/components/atoms/container-grid/container-grid.component';
import { ToastrService } from 'ngx-toastr';
import { LugaresService } from '../../../../shared/services/lugares/lugares.service';
import { LiderService } from '../../../../shared/services/lider/lider.service';
import { BaseModel } from '../../../../../models/base/base.model';
import {
  LiderModel,
  LugarVotacionModel,
} from '../../../../../models/lider/lider.model';
import { CardContactoComponent } from '../../../../shared/components/organism/card-contact/card-contacto.component';
import { SpinnerComponent } from '../../../../shared/components/modules/spinner/spinner.component';
import { ContainerSearchComponent } from '../../../../shared/components/modules/container-search/container-search.component';
import { ButtonComponent } from '../../../../shared/components/atoms/button/button.component';
import * as XLSX from 'xlsx';
import { AuthService } from '../../../../shared/services/auth/auth.service';

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
    ButtonComponent,
  ],
  providers: [LugaresService],
  templateUrl: './lista-lideres.component.html',
})
export class ListaLideresComponent implements OnInit {
  lideres: BaseModel<LiderModel>[] = [];
  data: BaseModel<LiderModel>[] = [];
  loadData: BaseModel<LiderModel>[] = [];
  spinner: boolean = true;

  constructor(
    private fb: FormBuilder,
    private liderService: LiderService,
    private toast: ToastrService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.getLideres();
  }

  getLideres() {
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
    this.data = data;
  }

  descargar(lideres: BaseModel<LiderModel>[]) {
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
      'Horario',
      'Documento',
      'Nombres',
      'Barrio',
      'Comuna',
      'Dirección',
      'Celular',
      'Correo electrónico',
      'Departamento de votación',
      'Municipio de votación',
      'Lugar de votación',
      'Mesa',
      'Emprendedor',
      'Fecha de nacimiento',
    ]);

    lideres.forEach((lider) => {
      const liderData = lider.data;
      const lugarVotacion =
        liderData.lugarVotacion || ({} as LugarVotacionModel); // Manejo de lugarVotacion opcional

      // ROWS
      datos.push([
        liderData.departamento.split('-')[1],
        liderData.municipio.split('-')[1],
        liderData.iglesia.split('-')[0],
        liderData.iglesia.split('-')[1],
        liderData.documento,
        liderData.nombres + '  ' + liderData.apellidos,
        liderData.barrio,
        liderData.comuna,
        liderData.direccion,
        liderData.celular,
        liderData.email,
        lugarVotacion.departamento.split('-')[1],
        lugarVotacion.municipio.split('-')[1],
        lugarVotacion.lugar,
        lugarVotacion.mesa,
        liderData.esEmprendedor ? 'Sí' : 'No',
        liderData.fechaNacimiento,
      ]);
    });

    return datos;
  }

  onFileChange(event: any): void {
    const target: DataTransfer = <DataTransfer>event.target;
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
    const uid = this.auth.uidUser()
    // Aquí puedes manipular los datos cargados del archivo Excel
    // Ejemplo: convertir los datos a un formato específico
    const usuarios = data.slice(1).map((row) => ({
      fechaCreacion: new Date().toISOString(),
      creadoPor: uid,
      data:   {
        departamento: '26-' + row[0],
        municipio: '897-' + row[1],
        iglesia: row[2] + '-' + row[3],
        documento: row[4],
        nombres: row[5],
        apellidos: '',
        barrio: row[6],
        comuna: row[7],
        direccion: row[8],
        celular: row[9],
        email: row[10],
        lugarVotacion: {
          departamento: '26-' + row[11],
          municipio: '897-' + row[12],
          lugar: row[13],
          mesa: row[14],
        },
        esEmprendedor: row[15] === 'Sí' ? true : false,
        fechaNacimiento: row[16],
      }

    }));
    this.loadData = usuarios

  }

async cargar() {
  this.toast.warning('Cargando datos, por favor espere');
  this.spinner = true;

  for (const lider of this.loadData) {
    await new Promise(resolve => setTimeout(resolve, 200));
    await this.cargarLider({
      ...lider,
      data: {
      ...lider.data,
      documento: lider.data.documento.toString(),
      fechaNacimiento: lider.data.fechaNacimiento ? lider.data.fechaNacimiento.toString() : ''
      }
    });
  }

  this.spinner = false;
  this.toast.success('Datos cargados exitosamente');
}

async cargarLider(data: BaseModel<LiderModel>) {
  try {
    console.log('data', data);
    await this.liderService.crearLiderConIdDocumento(data, data.data.documento);
    this.toast.success('Líder cargado exitosamente');
  } catch (error) {
    console.error('Error al cargar líder:', error);
    this.toast.error('Error al cargar líder');
  }
}



}
