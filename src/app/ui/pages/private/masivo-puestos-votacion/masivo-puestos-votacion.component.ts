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
import { InputSelectComponent } from '../../../shared/components/atoms/input-select/input-select.component';
import { IglesiaService } from '../../../shared/services/iglesia/iglesia.service';
import { SelectOptionModel } from '../../../../models/base/select-options.model';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-masivo-puestos-votacion',
    templateUrl: './masivo-puestos-votacion.component.html',
    standalone: true,
    imports: [CommonModule, ButtonComponent, ContainerAlertInformationComponent, InputSelectComponent, ReactiveFormsModule],
})
export class MasivoPuestosVotacionComponent implements OnInit {
    loading: boolean = false;
    puestos: any[] = [];
    contador: number = 0;
    iglesias: SelectOptionModel<string>[] = [];
    form: FormGroup;

    constructor(
        private readonly puestoService: PuestoVotacionService,
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
            nombre: String(row[0] ?? ''),
            mesastotales: Number(row[1] ?? 0),
            iglesiaId: this.form.value.iglesia,
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
            this.toast.error('Debe seleccionar una iglesia');
            return;
        }
        this.loading = true;
        const promises = this.puestos.map((puesto) => {
            this.guardarPuesto(puesto);
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

    async guardarPuesto(puestoItem: any) {
        const puestoModel: BaseModel<PuestoVotacionModel> = {
            data: {
                nombre: puestoItem.nombre,
                mesastotales: puestoItem.mesastotales,
                iglesiaId: puestoItem.iglesiaId,
                id: '' // Firestore generates ID, but model might require it. Check if needed or if BaseModel handles optional.
                // Assuming BaseModel<T> is { id?: string, data: T ... } or similar.
                // Checking Referidos logic: passed `ref.id` separately, but here addDoc generates it.
                // Let's pass empty string for now, will be updated by firestore naturally or not used in addDoc param.
            } as PuestoVotacionModel, // Cast to avoid strict type issues if interface differs slightly
            fechaCreacion: new Date().toISOString(),
            creadoPor: this.auth.uidUser() ?? '',
        };

        // Correction: PuestoVotacionModel interface had `id: string`. 
        // Usually detailed models separate ID logic. 
        // Let's follow the pattern but `createPuestoVotacion` uses `addDoc`.

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
