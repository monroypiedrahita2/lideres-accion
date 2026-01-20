import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComunaService } from '../../../../shared/services/comuna/comuna.service';
import { BaseModel } from '../../../../../models/base/base.model';
import { ComunaModel } from '../../../../../models/comuna/comuna.model';
import { ComunaCardComponent } from '../../../../shared/components/cards/comuna-card/comuna-card.component';
import { TitleComponent } from '../../../../shared/components/atoms/title/title.component';
import { PerfilModel } from '../../../../../models/perfil/perfil.model';
import { ConfirmActionComponent } from '../../../../shared/components/modules/modal/confirm-action.component';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-listar-comunas',
  standalone: true,
  imports: [CommonModule, ComunaCardComponent, TitleComponent, ConfirmActionComponent, ReactiveFormsModule],
  templateUrl: './listar-comunas.component.html',
  styleUrls: ['./listar-comunas.component.scss']
})
export class ListarComunasComponent implements OnInit {
  comunas: BaseModel<ComunaModel>[] = [];
  iglesia: string = JSON.parse(localStorage.getItem('usuario') || '{}').iglesia;
  usuario: PerfilModel = JSON.parse(localStorage.getItem('usuario') || '{}');

  // Pila de cursores para navegación: cada entrada es el `lastDoc` de esa página.
  pageStartAfter: any[] = [];
  currentPageIndex: number = 0;
  isFirstPage: boolean = true;
  isLastPage: boolean = false;

  showModal: boolean = false;
  dataModal: { name: string; id: string } = { name: '', id: '' };

  searchControl = new FormControl('');
  isSearching: boolean = false;
  searchText: string = '';

  constructor(private readonly comunaService: ComunaService, private readonly toast: ToastrService, private readonly router: Router) {}

  ngOnInit(): void {
    this.getComunas();

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchText => {
      this.searchText = searchText || '';
      if (this.searchText) {
        this.isSearching = true;
        this.performSearch();
      } else {
        this.isSearching = false;
        this.getComunas();
      }
    });
  }

  async getComunas() {
    try {
      // reset pagination
      this.pageStartAfter = [undefined];
      this.currentPageIndex = 0;
      const res: any = await this.comunaService.getPageByIglesia(this.iglesia);
      this.comunas = res.items;
      this.isFirstPage = true;
      this.isLastPage = !res.hasMore;
      if (res.lastDoc) this.pageStartAfter[1] = res.lastDoc;
    } catch (error) {
      console.error(error);
    }
  }

  async performSearch() {
    try {
      this.pageStartAfter = [undefined];
      this.currentPageIndex = 0;
      const res: any = await this.comunaService.getFirstPageBySearch(this.iglesia, this.searchText);
      this.comunas = res.items;
      this.isFirstPage = true;
      this.isLastPage = !res.hasMore;
      if (res.lastDoc) this.pageStartAfter[1] = res.lastDoc;
    } catch (error) {
      console.error(error);
    }
  }

  async nextPage() {
    try {
      const targetIndex = this.currentPageIndex + 1;
      const startAfterDoc = this.pageStartAfter[targetIndex];
      let res: any;
      if (this.isSearching) {
        res = await this.comunaService.getNextPageBySearch(this.iglesia, this.searchText);
      } else {
        res = await this.comunaService.getPageByIglesia(this.iglesia, startAfterDoc);
      }
      // store cursor for next page
      if (res.lastDoc) this.pageStartAfter[targetIndex + 1] = res.lastDoc;
      this.currentPageIndex = targetIndex;
      this.comunas = res.items;
      this.isFirstPage = this.currentPageIndex === 0;
      this.isLastPage = !res.hasMore;
    } catch (error) {
      console.error(error);
    }
  }

  async prevPage() {
    try {
      const targetIndex = this.currentPageIndex - 1;
      if (targetIndex < 0) return;
      const startAfterDoc = this.pageStartAfter[targetIndex];
      let res: any;
      if (this.isSearching) {
        res = await this.comunaService.getPreviousPageBySearch(this.iglesia, this.searchText);
      } else {
        res = await this.comunaService.getPageByIglesia(this.iglesia, startAfterDoc);
      }
      this.currentPageIndex = targetIndex;
      this.comunas = res.items;
      this.isFirstPage = this.currentPageIndex === 0;
      this.isLastPage = !res.hasMore;
    } catch (error) {
      console.error(error);
    }
  }

  openModal(data: { name: string; id: string }) {
    this.dataModal = data;
    this.showModal = true;
  }

  async eliminar(id: string) {
    try {
      await this.comunaService.deleteComuna(id);
      this.toast.success('Comuna eliminada exitosamente');
      this.showModal = false;
      // Recargar la página actual
      if (this.isSearching) {
        await this.performSearch();
      } else {
        await this.getComunas();
      }
    } catch (error) {
      console.error(error);
      this.toast.error('Error al eliminar la comuna');
    }
  }

  editar(id: string) {
    this.router.navigate(['/private/editar-comuna', id]);
  }

  clearSearch() {
    this.searchControl.setValue('');
  }
}
