import { ComunaService } from './../../../../shared/services/comuna/comuna.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { LugaresService } from '../../../../shared/services/lugares/lugares.service';
import { BaseModel } from '../../../../../models/base/base.model';
import { ReferidoModel } from '../../../../../models/referido/referido.model';
import { SpinnerComponent } from '../../../../shared/components/modules/spinner/spinner.component';
import { ButtonComponent } from '../../../../shared/components/atoms/button/button.component';
import * as XLSX from 'xlsx';
import { ReferidoService } from '../../../../shared/services/referido/referido.service';
import { InputTextComponent } from '../../../../shared/components/atoms/input-text/input-text.component';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TITULOS_DESCARGA } from '../../../../shared/const/titulos-excel.const';
import { PrivateRoutingModule } from '../../private-routing.module';
import { Router, RouterModule } from '@angular/router';
import { PersonInfoComponent } from '../../../../shared/components/cards/person-info/person-info.component';
import { PerfilModel } from '../../../../../models/perfil/perfil.model';
import { ConfirmActionComponent } from '../../../../shared/components/modules/modal/confirm-action.component';
import { ComunaModel } from '../../../../../models/comuna/comuna.model';
import { Subject, takeUntil } from 'rxjs';
import { MgPaginatorComponent } from '../../../../shared/components/modules/paginator/paginator.component';

@Component({
  selector: 'app-lista-referidos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
    ReactiveFormsModule,
    MgPaginatorComponent
  ],
  providers: [LugaresService],
  templateUrl: './lista-referidos.component.html',
})
export class ListaReridosComponent implements OnInit, OnDestroy {
  private readonly unsubscribe$ = new Subject<void>();
  formRef!: FormGroup;
  iglesia: string = JSON.parse(localStorage.getItem('usuario') || '{}').iglesia;
  usuario: PerfilModel = JSON.parse(localStorage.getItem('usuario') || '{}');
  referidos: BaseModel<ReferidoModel>[] = [];
  data: BaseModel<ReferidoModel>[] = [];
  spinner: boolean = false;
  showModal: boolean = false;
  searchText: string = '';
  dataModal: { name: string; id: string } = { name: '', id: '' };
  optionSelected:
    | 'Todos'
    | 'Cedula'
    | 'Internos'
    | 'Externos'
    | 'Testigos'
    | 'Nombre'
    | '' = 'Cedula';
  barrios: BaseModel<ComunaModel>[] = [];
  value_draft: string = localStorage.getItem('document_search_draft') || '';

  nombreLider: string = '';

  btnRecargar: boolean = false;

  hidePageSize = false;
  showPageSizeOptions = true;
  showFirstLastButtons = true;
  disabled = false;
  pageEvent: PageEvent | undefined = undefined;

  private avanceTimeout: any;
  isFirstPage: boolean = true;
  nombreBuscado: string = '';
  isLastPage: boolean = false;
  // Pila de cursores para navegación: cada entrada es el `lastDoc` de esa página.
  pageStartAfter: any[] = [];
  currentPageIndex: number = 0;

  constructor(
    private readonly referidoService: ReferidoService,
    private readonly toast: ToastrService,
    private readonly router: Router,
    private readonly comunaService: ComunaService,
    private readonly fb: FormBuilder
  ) {
    this.formRef = this.fb.group({
      documento: [''],
    });
  }

  ngOnInit(): void {
    if (this.usuario.rol === 'Pastor') {
      this.getComunas();
    }
    if (this.usuario.rol === 'Líder') {
      this.misReferidos(this.usuario.documento);
    }
    if (this.value_draft != '') {
      this.selectDocument(this.value_draft);
    }
    this.loadFormFromLocalStorage();

    this.formRef
      .get('documento')
      ?.valueChanges.pipe(
        takeUntil(this.unsubscribe$) // 👈 Agrega el operador aquí
      )
      .subscribe((value) => {
        if (value && value.length > 0) {
          this.selectDocument(value);
        }
      });
  }

  loadFormFromLocalStorage(): void {
    const savedData = localStorage.getItem('document_search_draft');
    if (savedData) {
      const data = JSON.parse(savedData);
      const currentValue = this.formRef.get('documento')?.value;
      if (currentValue !== data) {
        this.formRef.patchValue({ documento: data });
      }
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(); // 👈 Emite un valor para que takeUntil detenga las suscripciones
    this.unsubscribe$.complete(); // 👈 Completa el Subject para liberar recursos
  }

  getComunas() {
    this.comunaService.getComunas().subscribe({
      next: (res) => {
        this.barrios = res;
      },
      error: (err) => {
        console.error('Error getting lideres', err);
      },
      complete: () => { },
    });
  }

  selectDocument(value: string) {
    if (this.avanceTimeout) {
      clearTimeout(this.avanceTimeout);
    }

    if (this.optionSelected == 'Cedula') {
      this.avanceTimeout = setTimeout(() => {
        this.getReferidoByDocumentoAndIglesia(value);
        localStorage.setItem('document_search_draft', value);
      }, 800);
    } else if (this.optionSelected == 'Nombre') {
      this.nombreBuscado = value;
      // reset pagination state for name search
      this.pageStartAfter = [undefined];
      this.currentPageIndex = 0;
      this.referidoService.getPageByName(value, this.iglesia).then((res: any) => {
        this.referidos = res.items;
        this.isFirstPage = true;
        this.isLastPage = !res.hasMore;
        if (res.lastDoc) this.pageStartAfter[1] = res.lastDoc;
      });
    }
  }


  getBySearch(criterio: string, value: string | boolean) {
    this.spinner = true;
    this.nombreLider = '';
    this.data = [];
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
    this.referidoService
      .getReferidoByDocumentoAndIlgesia(documento, this.iglesia)
      .subscribe({
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
    this.referidos = [];
    this.data = [];
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

  buscarIndividual(
    option: 'Todos' | 'Cedula' | 'Internos' | 'Externos' | 'Testigos' | 'Nombre' | ''
  ) {
    this.optionSelected = option;
    this.formRef.reset();

    this.referidos = [];
    this.nombreLider = '';
    this.data = [];
    if (this.value_draft != '') {
      this.selectDocument(this.value_draft);
    }
  }

  async getReferidos() {
    this.spinner = true;
    try {
      // reset pagination for "Todos"
      this.pageStartAfter = [undefined];
      this.currentPageIndex = 0;
      const res: any = await this.referidoService.getPage(this.iglesia)
      this.spinner = false;
      this.referidos = res.items;
      this.isFirstPage = true;
      this.isLastPage = !res.hasMore;
      if (res.lastDoc) this.pageStartAfter[1] = res.lastDoc;
    } catch (error) {
      console.error(error);
    }
  }

  async nextPage() {
    try {
      if (this.optionSelected == 'Todos') {
        const targetIndex = this.currentPageIndex + 1;
        const startAfterDoc = this.pageStartAfter[targetIndex];
        const res: any = await this.referidoService.getPage(this.iglesia, startAfterDoc);
        // store cursor for next page
        if (res.lastDoc) this.pageStartAfter[targetIndex + 1] = res.lastDoc;
        this.currentPageIndex = targetIndex;
        this.referidos = res.items;
        this.isFirstPage = this.currentPageIndex === 0;
        this.isLastPage = !res.hasMore;
      } else if (this.optionSelected == 'Nombre') {
        if (!this.nombreBuscado) return;
        const targetIndex = this.currentPageIndex + 1;
        const startAfterDoc = this.pageStartAfter[targetIndex];
        const res: any = await this.referidoService.getPageByName(this.nombreBuscado, this.iglesia, startAfterDoc);
        if (res.lastDoc) this.pageStartAfter[targetIndex + 1] = res.lastDoc;
        this.currentPageIndex = targetIndex;
        this.referidos = res.items;
        this.isFirstPage = this.currentPageIndex === 0;
        this.isLastPage = !res.hasMore;
      }
    } catch (error) {
      console.error(error);
    }
  }

  async prevPage() {
    try {
      if (this.currentPageIndex === 0) return; // ya en primera
      // baja un índice y carga la página correspondiente usando startAfter almacenado
      this.currentPageIndex = Math.max(0, this.currentPageIndex - 1);
      const startAfterDoc = this.pageStartAfter[this.currentPageIndex];

      if (this.optionSelected == 'Todos') {
        const res: any = await this.referidoService.getPage(this.iglesia, startAfterDoc);
        this.referidos = res.items;
        this.isLastPage = false;
        this.isFirstPage = this.currentPageIndex === 0;
      } else if (this.optionSelected == 'Nombre') {
        if (!this.nombreBuscado) return;
        const res: any = await this.referidoService.getPageByName(this.nombreBuscado, this.iglesia, startAfterDoc);
        this.referidos = res.items;
        this.isLastPage = false;
        this.isFirstPage = this.currentPageIndex === 0;
      }
    } catch (error) {
      console.error(error);
    }
  }

  edit(referido: BaseModel<ReferidoModel>) {
    this.router.navigate(['private/editar-referido', referido.id]);
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
    this.btnRecargar = false;
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
      const barrio =
        this.barrios.find((barrio) => barrio.id === referidoData.barrio)?.data
          .barrio || '';
      const nombreReferente =
        referidos.find((referido) => referido.id === referidoData.referidoPor)
          ?.data.nombres +
        ' ' +
        referidos.find((referido) => referido.id === referidoData.referidoPor)
          ?.data.apellidos;

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
        nombreReferente,
      ]);
    });

    return datos;
  }

  contarReferidos(id: string): string {
    const cuenta = this.data.filter(
      (referido) => referido.data.referidoPor === id
    ).length;
    const cantidad = cuenta.toString();
    return cantidad + ' referidos';
  }

  filterReferidos(id: string, nombre: string) {
    this.referidos = this.data.filter(
      (referido) => referido.data.referidoPor === id
    );
    this.btnRecargar = true;
    this.nombreLider = nombre;
  }

  async eliminar(id: string) {
    try {
      await this.referidoService.deleteReferido(id);
      this.toast.success('Referido eliminado correctamente');
      this.showModal = false;
    } catch (error) {
      console.error(error);
    }
  }

  openModal(data: { name: string; id: string }) {
    this.showModal = true;
    this.dataModal = data;
    return true;
  }
}
