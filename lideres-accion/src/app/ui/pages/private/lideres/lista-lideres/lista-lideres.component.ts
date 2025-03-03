import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TitleComponent } from '../../../../shared/components/atoms/title/title.component';
import { ContainerGridComponent } from '../../../../shared/components/atoms/container-grid/container-grid.component';
import { ToastrService } from 'ngx-toastr';
import { LugaresService } from '../../../../shared/services/lugares/lugares.service';
import { LiderService } from '../../../../shared/services/lider/lider.service';
import { BaseModel } from '../../../../../models/base/base.model';
import { LiderModel } from '../../../../../models/lider/lider.model';
import { CardContactoComponent } from '../../../../shared/components/organism/card-contact/card-contacto.component';
import { SpinnerComponent } from '../../../../shared/components/modules/spinner/spinner.component';
import { ContainerSearchComponent } from '../../../../shared/components/modules/container-search/container-search.component';

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
    ContainerSearchComponent
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
    console.log(data);

  }





}
