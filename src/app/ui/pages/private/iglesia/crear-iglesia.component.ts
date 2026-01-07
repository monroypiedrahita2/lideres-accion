import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MgPaginatorComponent, PageEvent } from '../../../shared/components/modules/paginator/paginator.component';
import { ContainerGridComponent } from '../../../shared/components/atoms/container-grid/container-grid.component';
import { InputTextComponent } from '../../../shared/components/atoms/input-text/input-text.component';
import { LugaresService } from '../../../shared/services/lugares/lugares.service';
import { lastValueFrom } from 'rxjs';
import { SelectOptionModel } from '../../../../models/base/select-options.model';
import { ToastrService } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';
import { TitleComponent } from '../../../shared/components/atoms/title/title.component';
import { IglesiaModel } from '../../../../models/iglesia/iglesia.model';
import { InputSelectComponent } from '../../../shared/components/atoms/input-select/input-select.component';
import { IglesiaService } from '../../../shared/services/iglesia/iglesia.service';
import { BaseModel } from '../../../../models/base/base.model';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { SpinnerComponent } from '../../../shared/components/modules/spinner/spinner.component';
import { SubTitleComponent } from '../../../shared/components/atoms/sub-title/sub-title.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DialogEditarIglesiaComponent } from '../../../shared/dialogs/dialog-editar-iglesia/dialog-editar-iglesia.component';


@Component({
  selector: 'app-iglesias',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    ContainerGridComponent,
    InputTextComponent,
    InputSelectComponent,
    HttpClientModule,
    TitleComponent,
    SpinnerComponent,
    SubTitleComponent,
    MatDialogModule,
    MgPaginatorComponent
  ],
  providers: [LugaresService, IglesiaService],
  templateUrl: './crear-iglesia.component.html',
})
export class CrearIglesiaComponent implements OnInit {
  form!: FormGroup;
  searchControl = new FormControl('');
  departamentos: SelectOptionModel<string>[] = [];
  municipios: SelectOptionModel<string>[] = [];
  iglesia!: BaseModel<IglesiaModel>;
  perfiles: SelectOptionModel<string>[] = [];
  loading: boolean = false;
  spinner: boolean = true;
  iglesias: BaseModel<IglesiaModel>[] = [];

  // Pagination and Search
  filteredData: BaseModel<IglesiaModel>[] = [];
  paginatedData: BaseModel<IglesiaModel>[] = [];
  pageIndex: number = 0;
  pageSize: number = 5;
  length: number = 0;
  pageSizeOptions: number[] = [5, 10, 20, 50];


  horarios: SelectOptionModel<string>[] = [
    { value: 'Externo', label: 'Externo' },
    { value: '7:00 AM', label: '7:00 AM' },
    { value: '5:00 PM', label: '5:00 PM' },
    { value: '6:30 PM', label: '6:30 PM' },
    { value: '7:00 PM', label: '7:00 PM' },
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly lugarService: LugaresService,
    private readonly toastr: ToastrService,
    private readonly location: Location,
    private readonly auth: AuthService,
    private readonly iglesiaService: IglesiaService,
    private readonly dialog: MatDialog
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern(/^[^-]*$/)]],
      departamento: ['', Validators.required],
      municipio: ['', Validators.required],
      horario: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.getDepartamentos();
    this.getIglesias();
    this.setupSearch();
    this.form.get('municipio')?.disable();
    this.form.get('departamento')?.valueChanges.subscribe((departamento) => {
      if (departamento) {
        this.form.get('municipio')?.enable();
        this.getMunicipios(departamento.split('-')[0]);
      } else {
        this.form.get('municipio')?.disable();
        this.municipios = [];
        this.form.patchValue({ municipio: '' });
      }
    });
  }

  setupSearch() {
    this.searchControl.valueChanges.subscribe((value) => {
      this.filterData(value || '');
    });
  }

  filterData(query: string) {
    if (!query) {
      this.filteredData = [...this.iglesias];
    } else {
      const lowerQuery = query.toLowerCase();
      this.filteredData = this.iglesias.filter((iglesia) => {
        const nombre = iglesia.data.nombre.toLowerCase();
        const departamento = iglesia.data.departamento.split('-')[1]?.toLowerCase() || '';
        const municipio = iglesia.data.municipio.split('-')[1]?.toLowerCase() || '';
        return (
          nombre.includes(lowerQuery) ||
          departamento.includes(lowerQuery) ||
          municipio.includes(lowerQuery)
        );
      });
    }
    this.length = this.filteredData.length;
    this.pageIndex = 0; // Reset to first page on search
    this.updatePaginatedData();
  }

  updatePaginatedData() {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedData = this.filteredData.slice(start, end);
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedData();
  }

  editarIglesia(iglesia: BaseModel<IglesiaModel>) {
    const dialogRef = this.dialog.open(DialogEditarIglesiaComponent, {
      width: '600px',
      data: iglesia
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getIglesias();
      }
    });
  }

  async getDepartamentos() {
    try {
      const response = await lastValueFrom(
        this.lugarService.getDepartamentos()
      );
      this.departamentos = response.map((item: any) => ({
        label: item.name,
        value: item.id + '-' + item.name,
      }));
    } catch {
      this.toastr.error('Error al cargar los departamentos');
      this.location.back();
    }
  }

  async getMunicipios(departamento_id: string) {
    try {
      const response = await lastValueFrom(
        this.lugarService.getMunicipios(departamento_id)
      );
      this.form.patchValue({
        municipio: '',
      });
      this.municipios = response.map((item: any) => ({
        label: item.name,
        value: item.id + '-' + item.name,
      }));
    } catch {
      this.toastr.error('Error al cargar los municipios');
      this.location.back();
    }
  }

  async onSubmit() {
    this.loading = true;
    try {
      this.iglesia = {
        data: {
          nombre: this.form.value.nombre + ' - ' + this.form.value.horario,
          departamento: this.form.value.departamento,
          municipio: this.form.value.municipio,
        },
        fechaCreacion: new Date().toISOString(),
        creadoPor: this.auth.uidUser(),
      };
      const response = await this.iglesiaService.createIglesia(this.iglesia);
      this.toastr.success('Iglesia creada correctamente');
      this.loading = false;
      this.getIglesias(); // Refresh list after creation
      this.form.patchValue({
        nombre: '',
        horario: '',
      });
    } catch (error) {
      console.error(error);
      this.toastr.error('Error al crear la iglesia. Intente nuevamente.');
      this.loading = false;
    }
  }

  async getIglesias() {
    this.iglesiaService.getIglesias().subscribe({
      next: (iglesias) => {
        this.iglesias = iglesias;
        this.spinner = false;
        // Search & Pagination Init
        this.filteredData = [...this.iglesias];
        this.length = this.filteredData.length;
        this.updatePaginatedData();
        // Re-apply search if it exists
        if (this.searchControl.value) {
          this.filterData(this.searchControl.value);
        }
      },
      error: (error) => {
        console.error(error);
        this.toastr.error('Error al cargar las iglesias');
        this.spinner = false;
      },
    });
  }
}
