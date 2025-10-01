import { ComunaService } from './../../../../shared/services/comuna/comuna.service';
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
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TITULOS_DESCARGA } from '../../../../shared/const/titulos-excel.const';
import { PrivateRoutingModule } from "../../private-routing.module";
import { Router, RouterModule } from '@angular/router';
import { PersonInfoComponent } from '../../../../shared/components/modules/person-info/person-info.component';
import { PerfilModel } from '../../../../../models/perfil/perfil.model';
import { ConfirmActionComponent } from '../../../../shared/components/modules/modal/confirm-action.component';
import { ComunaModel } from '../../../../../models/comuna/comuna.model';

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
    PersonInfoComponent,
    ConfirmActionComponent,
    ReactiveFormsModule
],
  providers: [LugaresService],
  templateUrl: './lista-referidos.component.html',
})
export class ListaReridosComponent implements OnInit {
  formRef!: FormGroup
  iglesia: string = JSON.parse(localStorage.getItem('usuario') || '{}').iglesia;
  usuario: PerfilModel = JSON.parse(localStorage.getItem('usuario') || '{}');
  referidos: BaseModel<ReferidoModel>[] = [];
  data: BaseModel<ReferidoModel>[] = [];
  spinner: boolean = false;
  showModal: boolean = false;
  searchText: string = '';
  dataModal: { name: string; id: string } = { name: '', id: '' };
  optionSelected: 'Todos' | 'Cedula' | 'Internos' | 'Externos' | 'Testigos' | '' = 'Cedula';
  barrios: BaseModel<ComunaModel>[] = [];

  length = 50;
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 25];

  btnRecargar: boolean = false;

  hidePageSize = false;
  showPageSizeOptions = true;
  showFirstLastButtons = true;
  disabled = false;
  pageEvent: PageEvent | undefined = undefined;

  private avanceTimeout: any;


  constructor(
    private readonly referidoService: ReferidoService,
    private readonly toast: ToastrService,
    private readonly router: Router,
    private readonly comunaService: ComunaService,
    private readonly fb: FormBuilder
  ) {
    this.formRef = this.fb.group({
      documento: ['', [Validators.pattern('^[0-9]*$')]],
    });
  }

  ngOnInit(): void {
    this.getComunas();
    if (this.usuario.rol === 'Líder') {
      this.misReferidos(this.usuario.documento);
    }

      this.formRef.get('documento')?.valueChanges.subscribe((value) => {
      this.selectDocument(value);
    });
  }

  getComunas() {
    this.comunaService.getComunas().subscribe({
      next: (res) => {
       this.barrios = res;
      },
      error: (err) => {
        console.error('Error getting lideres', err);
      },
      complete: () => {},
    });
  }

    selectDocument(value: string) {
    if (this.avanceTimeout) {
      clearTimeout(this.avanceTimeout);
    }
    this.avanceTimeout = setTimeout(() => {
      this.getReferidoByDocumentoAndIglesia(value);
    }, 500);
  }
  getTestigos() {
    this.referidoService
      .getTestigos(this.usuario.iglesia!).subscribe({

        next: (res: BaseModel<ReferidoModel>[]) => {
          this.referidos = res;
        },
      })
      this.optionSelected = 'Testigos';
  }


  getBySearch(criterio: string, value: string | boolean) {
    this.spinner = true;
    this.optionSelected = value ? 'Internos' : 'Externos';
    this.referidoService.getReferidoBySearch(criterio, value).subscribe({
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

  getReferidoByDocumentoAndIglesia(documento: string) {
    this.spinner = true;
    this.referidoService.getReferidoByDocumentoAndIlgesia(documento, this.iglesia).subscribe({
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



  getAllReferidos() {
    this.spinner = true;
    this.optionSelected = 'Todos';
    this.getReferidos();
  }



  misReferidos(documento: string) {
    this.referidoService.getMyReferidos(documento).subscribe({
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

  buscarIndividual(option: 'Todos' | 'Cedula' | 'Internos' | 'Externos' | 'Testigos' | '') {
    this.optionSelected = option;
    this.referidos = [];
  }

    getReferidos() {
    this.spinner = true;
    this.referidoService.getReferidoByIglesia(this.iglesia).subscribe({
      next: (data) => {
        this.data = data
        this.referidos = this.data
          .map((referido: BaseModel<ReferidoModel>) => {
            return {
              ...referido,
              data: {
                ...referido.data,
                cantidadReferidos: this.contarReferidos(referido.id!),
              },
            }
          })
          .sort((a, b) => a.data.nombres.localeCompare(b.data.nombres))

        this.data = this.referidos
        this.spinner = false;
      },
      error: (error) => {
        console.error(error);
        this.spinner = false;
      },
    });
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
    this.btnRecargar = false
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
    datos.push(TITULOS_DESCARGA);

    referidos.forEach((referido) => {
      const referidoData = referido.data;
      const documento = referido.id;
      const barrio = this.barrios.find((barrio) => barrio.id === referidoData.barrio)?.data.barrio || '';
      const nombreReferente = referidos.find((referido) => referido.id === referidoData.referidoPor)?.data.nombres + ' ' + referidos.find((referido) => referido.id === referidoData.referidoPor)?.data.apellidos


      // ROWS
      datos.push([
        referidoData.isInterno ? 'Interno' : 'Externo',
        documento,
        referidoData.nombres,
        referidoData.apellidos,
        referidoData.celular,
        referidoData.email,
        referidoData.esEmprendedor ? 'SI' : 'NO',
        barrio.split(' - ')[0],
        barrio.split(' - ')[1],
        referidoData.direccion,
        referidoData.fechaNacimiento,
        referidoData.lugarVotacion,
        referidoData.mesaVotacion,
        referidoData.senado ? 'SI' : 'NO',
        referidoData.camara ? 'SI' : 'NO',
        referidoData.referidoPor,
        nombreReferente
      ]);
    });

    return datos;
  }

  contarReferidos(id: string): string {
    const cuenta = this.data.filter((referido) => referido.data.referidoPor === id).length;
    const cantidad = cuenta.toString();
    return cantidad + ' referidos';
  }

  filterReferidos(id: string) {
    this.referidos = this.data.filter((referido) =>referido.data.referidoPor === id);
    this.btnRecargar = true;
  }

  async eliminar(id: string) {
    try {
      await this.referidoService.deleteReferido(id)
      this.toast.success('Referido eliminado correctamente');
      this.showModal = false;
    } catch (error) {
      console.error(error);
    }
  }

  openModal(data: { name: string; id: string }) {
    this.showModal = true;
    this.dataModal = data;
    return true
  }
}
