import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import { ButtonComponent } from '../../../shared/components/atoms/button/button.component';
import { ContainerAlertInformationComponent } from '../../../shared/components/modules/container-alert-information/container-alert-information.component';
import {
    DESCRIPCION_EXCEL_COMUNAS,
    TITULOS_EXCEL_COMUNAS,
} from '../../../shared/const/titulos-excel.const';
import { ComunaService } from '../../../shared/services/comuna/comuna.service';
import { ComunaModel } from '../../../../models/comuna/comuna.model';
import { BaseModel } from '../../../../models/base/base.model';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { InputSelectComponent } from '../../../shared/components/atoms/input-select/input-select.component';
import { IglesiaService } from '../../../shared/services/iglesia/iglesia.service';
import { SelectOptionModel } from '../../../../models/base/select-options.model';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-masivo-comunas',
    templateUrl: './masivo-comunas.component.html',
    standalone: true,
    imports: [CommonModule, ButtonComponent, ContainerAlertInformationComponent, InputSelectComponent, ReactiveFormsModule],
})
export class MasivoComunasComponent implements OnInit {
    loading: boolean = false;
    comunas: any[] = [];
    contador: number = 0;
    iglesias: SelectOptionModel<string>[] = [];
    form: FormGroup;

    constructor(
        private readonly comunaService: ComunaService,
        private readonly toast: ToastrService,
        private readonly auth: AuthService,
        private readonly iglesiaService: IglesiaService,
        private readonly fb: FormBuilder
    ) {
        this.form = this.fb.group({
            iglesia: ['', Validators.required]
        });
    }

    ngOnInit(): void {
        this.getIglesias();
    }

    getIglesias() {
        this.iglesiaService.getIglesias().subscribe((res) => {
            this.iglesias = res.map((item: any) => ({
                label: item.data.nombre,
                value: item.id,
            }));
        });
    }

    onFileChange(event: any): void {
        if (this.form.invalid) {
            this.toast.error('Debe seleccionar una iglesia antes de cargar el archivo');
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
        const registros = data.slice(1).map((row) => ({
            departamento: String(row[0] ?? ''),
            municipio: String(row[1] ?? ''),
            comuna: String(row[2] ?? ''),
            barrio: String(row[3] ?? ''),
            iglesiaId: this.form.value.iglesia,
            guardado: false
        }));
        this.comunas = registros;
    }

    descargar() {
        const datos = this.transformarDatos();
        const libro = XLSX.utils.book_new();
        const hoja = XLSX.utils.aoa_to_sheet(datos);
        XLSX.utils.book_append_sheet(libro, hoja, 'Comunas');
        XLSX.writeFile(libro, 'plantilla_comunas.xlsx');
    }

    transformarDatos(): any[][] {
        const datos: any[][] = [];
        datos.push(TITULOS_EXCEL_COMUNAS);
        datos.push(DESCRIPCION_EXCEL_COMUNAS);
        return datos;
    }

    save() {
        if (this.form.invalid) {
            this.toast.error('Debe seleccionar una iglesia');
            return;
        }
        this.loading = true;
        const promises = this.comunas.map((comuna) => {
            this.guardarComuna(comuna);
            return Promise.resolve();
        });
        Promise.all(promises)
            .then(() => {
                this.toast.info('Proceso de guardado finalizado');
            })
            .catch((error) => {
                this.toast.error('Error durante el guardado');
                console.error(error);
            })
            .finally(() => {
                this.loading = false;
            });
    }

    async guardarComuna(comunaItem: any) {
        const comunaModel: BaseModel<ComunaModel> = {
            data: {
                departamento: comunaItem.departamento,
                municipio: comunaItem.municipio,
                barrio: comunaItem.barrio,
                comuna: comunaItem.comuna,
                iglesiaId: comunaItem.iglesiaId,
            },
            fechaCreacion: new Date().toISOString(),
            creadoPor: this.auth.uidUser() ?? '',
        };

        try {
            await this.comunaService.createComuna(comunaModel);
            this.contador++;
            comunaItem.guardado = true;

        } catch (error) {
            comunaItem.guardado = 'error';
            console.error(error);
        }
    }

    clear() {
        this.comunas = [];
        this.contador = 0;
    }
}
