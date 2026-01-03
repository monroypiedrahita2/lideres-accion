import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';
import { ContainerAlertInformationComponent } from '../../../shared/components/modules/container-alert-information/container-alert-information.component';
import {
  DESCRIPCION_EXCEL,
  TITULOS_EXCEL,
} from '../../../shared/const/titulos-excel.const';
import { ReferidoService } from '../../../shared/services/referido/referido.service';
import { ReferidoModel } from '../../../../models/referido/referido.model';
import { BaseModel } from '../../../../models/base/base.model';
import { PerfilModel } from '../../../../models/perfil/perfil.model';
import { PerfilService } from '../../../shared/services/perfil/perfil.service';
import { AuthService } from '../../../shared/services/auth/auth.service';

@Component({
  selector: 'app-masivo-referidos',
  templateUrl: './masivo-referidos.component.html',
  standalone: true,
  imports: [CommonModule, ButtonComponent, ContainerAlertInformationComponent],
})
export class MasivoReferidosComponent {
  iglesia: string = JSON.parse(localStorage.getItem('usuario') || '{}').iglesia;
  usuario: PerfilModel = JSON.parse(localStorage.getItem('usuario') || '{}');
  loading: boolean = false;
  accion: 'Crear' | 'Editar' = 'Crear';
  enableSkeleton: boolean = true;
  emailEnabled: boolean = true;
  referidos: ReferidoModel[] = [];
  contador: number = 0;

  constructor(
    private readonly referidoService: ReferidoService,
    private readonly toast: ToastrService,
    private readonly perfilService: PerfilService,
    private readonly auth: AuthService
  ) { }

  onFileChange(event: any): void {
    const target: DataTransfer = <DataTransfer>event.target;
    if (target.files.length !== 1) {
      this.toast.error('Solo se puede cargar un archivo a la vez');
      return;
    }

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const arrayBuffer: ArrayBuffer = e.target.result;
      const uint8Array = new Uint8Array(arrayBuffer);
      const bstr = Array.from(uint8Array, (byte) =>
        String.fromCharCode(byte)
      ).join('');
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      this.processExcelData(data as any[][]);
    };
    reader.readAsArrayBuffer(target.files[0]);
  }

  processExcelData(data: any[][]): void {
    const usuarios = data.slice(1).map((row) => ({
      isInterno: row[0] === 'Interno',
      documento: String(row[1] ?? ''),
      nombres: String(row[2] ?? ''),
      apellidos: String(row[3] ?? ''),
      celular: String(row[4] ?? ''),
      email: String(row[5] ?? ''),
      esEmprendedor: row[6] === 'SI',
      comuna: String(row[7] ?? ''),
      barrio: String(row[8] ?? ''),
      direccion: String(row[9] ?? ''),
      iglesia: String(this.iglesia),
      fechaNacimiento: String(row[10] ?? ''),
      lugarVotacion: String(row[11] ?? ''),
      mesaVotacion: String(row[12] ?? ''),
      senado: row[13] === 'SI',
      camara: row[14] === 'SI',
      referidoPor: String(row[15] ?? ''),
    }));
    this.referidos = usuarios;
  }

  descargar() {
    const datos = this.transformarDatos();
    const libro = XLSX.utils.book_new();
    const hoja = XLSX.utils.aoa_to_sheet(datos);
    XLSX.utils.book_append_sheet(libro, hoja, 'Referidos');
    XLSX.writeFile(libro, 'referidos.xlsx');
  }

  transformarDatos(): any[][] {
    const datos: any[][] = [];

    // Encabezados
    datos.push(TITULOS_EXCEL);

    // ROWS
    datos.push(DESCRIPCION_EXCEL);

    return datos;
  }

  save() {
    this.loading = true;
    const promises = this.referidos.map((referido) => {
      this.guardarReferido(referido);
      return Promise.resolve();
    });
    Promise.all(promises)
      .then(() => {
        this.toast.info('Iniciando a guardar');
      })
      .catch((error) => {
        this.toast.error('Vuelva a intentarlo más tarde');

      })
      .finally(() => {
      });
  }

  async guardarReferido(referido: ReferidoModel) {
    const ref: BaseModel<ReferidoModel> = {
      id: referido.documento,
      data: referido,
      fechaCreacion: new Date().toISOString(),
      creadoPor: this.auth.uidUser() ?? '',
    };
    try {
      await this.referidoService.crearReferidoConIdDocumento(ref, ref.id!)
      this.contador++;
      referido.guardado = true;
      this.toast.success(
        `Referido ${ref.data.nombres} ${ref.data.apellidos} guardado exitosamente`
      );
      if (this.contador === this.referidos.length) {
        this.toast.info('Se termino el guardado');
        this.loading = false;
      }
    } catch (error) {
      this.toast.error(
        `Error al guardar el referido ${ref.data.nombres} ${ref.data.apellidos}`
      );
      referido.guardado = 'error';
      console.error(error);
    }
  }





  clear() {
    this.referidos = [];
  }


}
