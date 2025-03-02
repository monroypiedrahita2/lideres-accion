import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextComponent } from '../../../../shared/components/atoms/input-text/input-text.component';
import { TitleComponent } from '../../../../shared/components/atoms/title/title.component';
import { ContainerGridComponent } from '../../../../shared/components/atoms/container-grid/container-grid.component';
import { ToastrService } from 'ngx-toastr';
import { LugaresService } from '../../../../shared/services/lugares/lugares.service';
import { LiderService } from '../../../../shared/services/lider/lider.service';
import { BaseModel } from '../../../../../models/base/base.model';
import { LiderModel } from '../../../../../models/lider/lider.model';
import { CardContactoComponent } from '../../../../shared/components/organism/card-contact/card-contacto.component';

@Component({
  selector: 'app-lista-lideres',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextComponent,
    TitleComponent,
    ContainerGridComponent,
    CardContactoComponent,
    ContainerGridComponent

  ],
  providers: [LugaresService],
  templateUrl: './lista-lideres.component.html',
})
export class ListaLideresComponent implements OnInit {
  form!: FormGroup;
  lideres: BaseModel<LiderModel>[] = []


  constructor (
    private fb: FormBuilder,
    private liderService: LiderService,
    private toast: ToastrService
  ) {
    this.form = this.fb.group({
      busqueda: [''],
    })
  }

  ngOnInit(): void {
    this.liderService.getLideres().subscribe({
      next: (data) => {
        console.log(data)
        this.lideres = data;
      },
      error: (error) => console.error(error)
    })
  }





    onSubmit() {

    }


}
