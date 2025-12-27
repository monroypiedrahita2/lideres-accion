import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComunaService } from '../../../../shared/services/comuna/comuna.service';
import { BaseModel } from '../../../../../models/base/base.model';
import { ComunaModel } from '../../../../../models/comuna/comuna.model';
import { ComunaCardComponent } from '../../../../shared/components/modules/comuna-card/comuna-card.component';
import { TitleComponent } from '../../../../shared/components/atoms/title/title.component';
import { PerfilModel } from '../../../../../models/perfil/perfil.model';

@Component({
  selector: 'app-listar-comunas',
  standalone: true,
  imports: [CommonModule, ComunaCardComponent, TitleComponent],
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

  constructor(private readonly comunaService: ComunaService) {}

  ngOnInit(): void {
    this.getComunas();
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

  async nextPage() {
    try {
      const targetIndex = this.currentPageIndex + 1;
      const startAfterDoc = this.pageStartAfter[targetIndex];
      const res: any = await this.comunaService.getPageByIglesia(this.iglesia, startAfterDoc);
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
      const res: any = await this.comunaService.getPageByIglesia(this.iglesia, startAfterDoc);
      this.currentPageIndex = targetIndex;
      this.comunas = res.items;
      this.isFirstPage = this.currentPageIndex === 0;
      this.isLastPage = !res.hasMore;
    } catch (error) {
      console.error(error);
    }
  }
}
