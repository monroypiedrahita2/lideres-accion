import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';
import { ContainerAlertInformationComponent } from '../../../shared/components/modules/container-alert-information/container-alert-information.component';
import {
    DESCRIPCION_EXCEL_PUESTOS,
    TITULOS_EXCEL_PUESTOS,
} from '../../../shared/const/titulos-excel.const';
import { PuestoVotacionService } from '../../../shared/services/puesto-votacion/puesto-votacion.service';
import { PuestoVotacionModel } from '../../../../models/puesto-votacion/puesto-votacion.model';
import { BaseModel } from '../../../../models/base/base.model';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { SelectOptionModel } from '../../../../models/base/select-options.model';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MgPaginatorComponent, PageEvent } from '../../../shared/components/modules/paginator/paginator.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogNotificationComponent } from '../../../shared/dialogs/dialog-notification/dialog-nofication.component';
import { DialogNotificationModel } from '../../../../models/base/dialog-notification.model';
import { MUNICIPIOS } from '../../../shared/const/municipios.const';
import { InputSelectComponent } from '../../../shared/components/atoms/input-select/input-select.component';

@Component({
    selector: 'app-masivo-puestos-votacion',
    templateUrl: './masivo-puestos-votacion.component.html',
    standalone: true,
    imports: [CommonModule, ButtonComponent, ContainerAlertInformationComponent, ReactiveFormsModule, MgPaginatorComponent, InputSelectComponent],
})
export class MasivoPuestosVotacionComponent implements OnInit {
    loading: boolean = false;
    puestos: any[] = [];
    contador: number = 0;
    municipios: SelectOptionModel<string>[] = MUNICIPIOS;
    form: FormGroup;

    puestosExistentes: any[] = [];
    totalRecords: number = 0;
    pageSize: number = 5;
    pageIndex: number = 0;

    constructor(
        private readonly puestoService: PuestoVotacionService,
        private readonly toast: ToastrService,
        private readonly auth: AuthService,
        private readonly fb: FormBuilder,
        private readonly dialog: MatDialog
    ) {
        this.form = this.fb.group({
            municipio: ['', Validators.required]
        });

        // Cargar puestos cuando cambie el municipio seleccionado

    }

    ngOnInit(): void {
        this.form.get('municipio')!.valueChanges.subscribe((municipio) => {
            if (municipio) {
                this.loadPuestos();
            } else {
                this.puestosExistentes = [];
                this.totalRecords = 0;
            }
        });
    }

    onNextPage() {
        const municipio = this.form.get('municipio')?.value;
        if (municipio) {
            this.puestoService.getNextPageByMunicipio(municipio, this.pageSize).then((res) => {
                if (res.items.length > 0) {
                    this.puestosExistentes = res.items;
                    this.pageIndex++;
                }
            });
        }
    }

    onPreviousPage() {
        const municipio = this.form.get('municipio')?.value;
        if (municipio && this.pageIndex > 0) {
            this.puestoService.getPreviousPageByMunicipio(municipio, this.pageSize).then((res) => {
                if (res.items.length > 0) {
                    this.puestosExistentes = res.items;
                    this.pageIndex--;
                }
            });
        }
    }

    deletePuesto(puesto: BaseModel<PuestoVotacionModel>) {
        const data: DialogNotificationModel = {
            title: 'Eliminar Puesto',
            message: `¿Estás seguro de eliminar el puesto ${puesto.data.nombre}?`,
            bottons: 'Si, Eliminar',
            type: 'warning',
            actionText: 'Cancelar'
        };

        const dialogRef = this.dialog.open(DialogNotificationComponent, {
            width: '450px',
            data: data
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.puestoService.deletePuestoVotacion(puesto.id!).then(() => {
                    this.toast.success('Puesto eliminado correctamente');
                    this.loadPuestos();
                }).catch((error) => {
                    this.toast.error('Error al eliminar el puesto');
                    console.error(error);
                });
            }
        });
    }

    onPageChange(event: PageEvent) {
        if (event.pageSize !== this.pageSize) {
            this.pageSize = event.pageSize;
            this.loadPuestos();
        }
    }

    loadPuestos() {
        const municipio = this.form.get('municipio')?.value;
        if (municipio) {
            this.pageIndex = 0;
            this.puestoService.countByMunicipio(municipio).then((count) => {
                this.totalRecords = count;
            });
            this.puestoService.getFirstPageByMunicipio(municipio, this.pageSize).then((res) => {
                this.puestosExistentes = res.items;
            });
        }
    }

    onFileChange(event: any): void {
        if (this.form.invalid) {
            this.toast.error('Debe seleccionar un municipio antes de cargar el archivo');
            return;
        }

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
        const municipio = this.form.value.municipio;
        const registros = data.slice(1).map((row) => ({
            nombre: String(row[0] ?? ''),
            mesastotales: Number(row[1] ?? 0),
            ubicacion: String(row[2] ?? ''),
            municipio: municipio,
            guardado: false
        }));
        this.puestos = registros;
    }

    descargar() {
        const datos = this.transformarDatos();
        const libro = XLSX.utils.book_new();
        const hoja = XLSX.utils.aoa_to_sheet(datos);
        XLSX.utils.book_append_sheet(libro, hoja, 'PuestosVotacion');
        XLSX.writeFile(libro, 'plantilla_puestos.xlsx');
    }

    transformarDatos(): any[][] {
        const datos: any[][] = [];
        datos.push(TITULOS_EXCEL_PUESTOS);
        datos.push(DESCRIPCION_EXCEL_PUESTOS);
        return datos;
    }

    save() {
        if (this.form.invalid) {
            this.toast.error('Debe seleccionar un municipio');
            return;
        }
        this.loading = true;
        const promises = this.puestos.map((puesto) => this.guardarPuesto(puesto));
        Promise.all(promises)
            .then(() => {
                this.toast.info('Proceso de guardado finalizado');
                this.loadPuestos();
            })
            .catch((error) => {
                this.toast.error('Error durante el guardado');
                console.error(error);
            })
            .finally(() => {
                this.loading = false;
            });
    }

    async guardarPuesto(puestoItem: any) {
        const puestoModel: BaseModel<PuestoVotacionModel> = {
            data: {
                nombre: puestoItem.nombre,
                mesastotales: puestoItem.mesastotales,
                municipio: puestoItem.municipio,
                ubicacion: puestoItem.ubicacion,
            } as PuestoVotacionModel,
            fechaCreacion: new Date().toISOString(),
            creadoPor: this.auth.uidUser() ?? '',
        };

        try {
            await this.puestoService.createPuestoVotacion(puestoModel);
            this.contador++;
            puestoItem.guardado = true;
        } catch (error) {
            puestoItem.guardado = 'error';
            console.error(error);
        }
    }

    clear() {
        this.puestos = [];
        this.contador = 0;
    }
}
