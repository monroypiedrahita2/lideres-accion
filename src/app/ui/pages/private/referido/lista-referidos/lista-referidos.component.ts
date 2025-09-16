import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TitleComponent } from '../../../../shared/components/atoms/title/title.component';
import { ToastrService } from 'ngx-toastr';
import { LugaresService } from '../../../../shared/services/lugares/lugares.service';
import { BaseModel } from '../../../../../models/base/base.model';
import { ReferidoModel } from '../../../../../models/referido/referido.model';
import { SpinnerComponent } from '../../../../shared/components/modules/spinner/spinner.component';
import { ButtonComponent } from '../../../../shared/components/atoms/button/button.component';
import * as XLSX from 'xlsx';
import { ReferidoService } from '../../../../shared/services/referido/referido.service';
import { InputTextComponent } from '../../../../shared/components/atoms/input-text/input-text.component';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TITULOS_EXCEL } from '../../../../shared/const/titulos-excel.const';
import { PrivateRoutingModule } from "../../private-routing.module";
import { Router, RouterModule } from '@angular/router';
import { PersonInfoComponent } from '../../../../shared/components/modules/person-info/person-info.component';

@Component({
  selector: 'app-lista-referidos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TitleComponent,
    SpinnerComponent,
    InputTextComponent,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    ButtonComponent,
    PrivateRoutingModule,
    RouterModule,
    PersonInfoComponent
],
  providers: [LugaresService],
  templateUrl: './lista-referidos.component.html',
})
export class ListaReridosComponent implements OnInit {
  iglesia: any = JSON.parse(localStorage.getItem('usuario') || '{}').iglesia;
  referidos: BaseModel<ReferidoModel>[] = [];
  data: BaseModel<ReferidoModel>[] = [];
  spinner: boolean = true;
  searchText: string = '';

  length = 50;
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 25];

  hidePageSize = false;
  showPageSizeOptions = true;
  showFirstLastButtons = true;
  disabled = false;
  pageEvent: PageEvent | undefined = undefined;

  constructor(
    private readonly referidoService: ReferidoService,
    private readonly toast: ToastrService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.getReferidos();
  }

  edit(referido: BaseModel<ReferidoModel>) {
    this.router.navigate(['private/editar-referido', referido.id]);
  }

  handlePageEvent(e: PageEvent) {
    this.pageEvent = e;
    this.length = e.length;
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
  }

  getReferidos() {
    this.referidoService.getReferidoByIglesia(this.iglesia).subscribe({
      next: (data) => {
        this.data = data;
        this.referidos = data;
        this.spinner = false;
      },
      error: (error) => {
        console.error(error);
        this.spinner = false;
      },
    });
  }

  onSearch(data: string) {
    this.referidos = this.data.filter(
      (referido) =>
        referido.data.nombres.toLowerCase().includes(data.toLowerCase()) ||
        referido.data.apellidos.toLowerCase().includes(data.toLowerCase()) ||
        referido.data.celular.toLowerCase().includes(data.toLowerCase()) ||
        referido.id?.toLowerCase().includes(data.toLowerCase() || '')
    );
  }

  clear() {
    this.searchText = '';
    this.referidos = this.data;
  }

  descargar(referidos: BaseModel<ReferidoModel>[]) {
    const datos = this.transformarDatos(referidos);
    const libro = XLSX.utils.book_new();
    const hoja = XLSX.utils.aoa_to_sheet(datos);
    XLSX.utils.book_append_sheet(libro, hoja, 'Referidos');
    XLSX.writeFile(libro, 'referidos.xlsx');
  }

  transformarDatos(referidos: BaseModel<ReferidoModel>[]): any[][] {
    const datos: any[][] = [];

    // Encabezados
    datos.push(TITULOS_EXCEL);

    referidos.forEach((referido) => {
      const referidoData = referido.data;
      const documento = referido.id;

      // ROWS
      datos.push([
        referidoData.isInterno,
        documento,
        referidoData.nombres,
        referidoData.apellidos,
        referidoData.celular,
        referidoData.email,
        referidoData.esEmprendedor ? 'SI' : 'NO',
        referidoData.comuna,
        referidoData.barrio,
        referidoData.direccion,
        referidoData.fechaNacimiento,
        referidoData.lugarVotacion,
        referidoData.mesaVotacion,
        referidoData.senado ? 'SI' : 'NO',
        referidoData.camara ? 'SI' : 'NO',
        referidoData.referidoPor,
      ]);
    });

    return datos;
  }
}
