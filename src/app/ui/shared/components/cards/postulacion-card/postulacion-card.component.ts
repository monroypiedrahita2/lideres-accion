import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { IconButtonComponent } from '../../atoms/icon-button/icon-button.component';
import { IconWhatsappComponent } from '../../atoms/icon-whatsapp/icon-whatsapp.component';
import { ButtonComponent } from '../../atoms/button/button.component';
import { PerfilModel } from '../../../../../models/perfil/perfil.model';
import { VehiculoModel } from '../../../../../models/vehiculo/vehiculo.model';
import { BaseModel } from '../../../../../models/base/base.model';
import { TestigoAsociadoModel } from '../../../../../models/testigo-asociado/testigo-asociado.model';

@Component({
    selector: 'app-postulacion-card',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        MatIconModule,
        MatExpansionModule,
        IconButtonComponent,
        IconWhatsappComponent,
        ButtonComponent
    ],
    templateUrl: './postulacion-card.component.html',
    styleUrls: []
})
export class PostulacionCardComponent {
    @Input() usuario: PerfilModel | null = null;
    @Input() vehiculoStatus: string | null = null;

    ngOnInit() {
        if (!this.usuario || !this.usuario.postulado) {
            const storedUser = localStorage.getItem('usuario');
            if (storedUser) {
                try {
                    this.usuario = JSON.parse(storedUser);
                } catch (e) {
                    console.error('Error parsing stored user', e);
                }
            }
        }
    }
    @Input() vehiculoInfo: { casaApoyo: string; direccion?: string; barrio?: string; responsableTelefono?: string } | null = null;
    @Input() currentVehiculo: VehiculoModel | null = null;

    @Input() casaApoyoStatus: string | null = null;
    @Input() casaApoyoVehiculos: VehiculoModel[] = [];

    @Input() testigoStatus: string | null = null;
    @Input() testigoInfo: { puesto: string, mesa: string } | null = null;
    @Input() misTestigos: BaseModel<TestigoAsociadoModel>[] = [];

    @Output() statusUpdate = new EventEmitter<'Activo' | 'Inactivo' | 'En carrera'>();
    @Output() navigateResults = new EventEmitter<void>();

    updateVehiculoStatus(estado: 'Activo' | 'Inactivo' | 'En carrera') {
        this.statusUpdate.emit(estado);
    }

    onNavigateResults() {
        this.navigateResults.emit();
    }

    getBorderColor(status: string | null): string {
        switch (status) {
            case 'Aprobado':
            case 'Asignado':
                return 'border-green-500';
            case 'Pendiente':
            case 'Pendiente de asignación':
                return 'border-yellow-500';
            case 'No registrado':
                return 'border-gray-500';
            default:
                return 'border-red-500';
        }
    }

    getTextColor(status: string | null): string {
        switch (status) {
            case 'Aprobado':
            case 'Asignado':
                return 'text-green-600';
            case 'Pendiente':
            case 'Pendiente de asignación':
                return 'text-yellow-600';
            case 'No registrado':
                return 'text-gray-600';
            default:
                return 'text-red-600';
        }
    }

    getStatusColor(estado: string | undefined): string {
        switch (estado) {
            case 'Activo': return 'bg-green-100 text-green-800';
            case 'Inactivo': return 'bg-red-100 text-red-800';
            case 'En carrera': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }
}
