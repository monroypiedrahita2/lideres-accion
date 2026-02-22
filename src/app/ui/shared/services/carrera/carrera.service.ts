import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, doc, setDoc, query, where, collectionData, updateDoc, arrayUnion, arrayRemove, deleteDoc } from '@angular/fire/firestore';
import { AsignarCarreraModel, CreateCarreraModel } from '../../../../models/carrera/carrera.model';
import { environment } from '../../../../../environment';
import { Observable } from 'rxjs';
import { VehiculoService } from '../vehiculo/vehiculo.service';

@Injectable({
    providedIn: 'root'
})
export class CarreraService {
    _collection: string = environment.collections.carreras;

    constructor(
        private readonly firestore: Firestore,
        private readonly vehiculoService: VehiculoService
    ) { }

    createCarrera(carrera: CreateCarreraModel | AsignarCarreraModel) {
        console.log('[CarreraService] createCarrera →', { carrera });
        const collectionRef = collection(this.firestore, this._collection);
        return addDoc(collectionRef, carrera);
    }

    getCarrerasCreadasPor(uid: string) {
        console.log('[CarreraService] getCarrerasCreadasPor →', { uid });
        const q = query(
            collection(this.firestore, this._collection),
            where('creadaPor', '==', uid)
        );
        return collectionData(q, { idField: 'id' }) as Observable<CreateCarreraModel[]>;
    }

    getCarrerasAsignadasAVehiculo(vehiculoId: string) {
        console.log('[CarreraService] getCarrerasAsignadasAVehiculo →', { vehiculoId });
        const q = query(
            collection(this.firestore, this._collection),
            where('vehiculoIdAprobado', '==', vehiculoId)
        );
        return collectionData(q, { idField: 'id' }) as Observable<CreateCarreraModel[]>;
    }

    getCarrerasEnRuta(municipio?: string) {
        console.log('[CarreraService] getCarrerasEnRuta →', { municipio });
        let q;
        if (municipio) {
            q = query(
                collection(this.firestore, this._collection),
                where('estado', '==', 'En ruta'),
                where('municipio', '==', municipio)
            );
        } else {
            q = query(
                collection(this.firestore, this._collection),
                where('estado', '==', 'En ruta')
            );
        }
        return collectionData(q, { idField: 'id' }) as Observable<CreateCarreraModel[]>;
    }

    getCarrerasDisponibles(tipoVehiculo: string | string[], municipio: string) {
        console.log('[CarreraService] getCarrerasDisponibles →', { tipoVehiculo, municipio });
        let q;
        if (Array.isArray(tipoVehiculo)) {
            q = query(
                collection(this.firestore, this._collection),
                where('estado', '==', 'Abierto'),
                where('municipio', '==', municipio),
                where('tipoVehiculo', 'in', tipoVehiculo)
            );
        } else {
            q = query(
                collection(this.firestore, this._collection),
                where('estado', '==', 'Abierto'),
                where('municipio', '==', municipio),
                where('tipoVehiculo', '==', tipoVehiculo)
            );
        }
        return collectionData(q, { idField: 'id' }) as Observable<CreateCarreraModel[]>;
    }

    async postularse(carreraId: string, postulacion: any) {
        console.log('[CarreraService] postularse →', { carreraId, postulacion });
        const docRef = doc(this.firestore, this._collection, carreraId);
        return updateDoc(docRef, {
            postulados: arrayUnion(postulacion)
        });
    }

    async aprobarConductor(carreraId: string, vehiculoId: string, conductorId: string, datosConductor?: any) {
        console.log('[CarreraService] aprobarConductor →', { carreraId, vehiculoId, conductorId });
        const docRef = doc(this.firestore, this._collection, carreraId);
        const dataToUpdate: any = {
            vehiculoIdAprobado: vehiculoId,
            seleccionadoId: vehiculoId,
            estado: 'En ruta'
        };
        if (datosConductor) {
            dataToUpdate.datosConductorAprobado = datosConductor;
        }
        return updateDoc(docRef, dataToUpdate);
    }

    async cancelarPostulacion(carreraId: string, postulacion: any) {
        console.log('[CarreraService] cancelarPostulacion →', { carreraId, postulacion });
        const docRef = doc(this.firestore, this._collection, carreraId);
        return updateDoc(docRef, {
            postulados: arrayRemove(postulacion)
        });
    }

    async eliminarVehiculoSeleccionado(carreraId: string) {
        console.log('[CarreraService] eliminarVehiculoSeleccionado →', { carreraId });
        const docRef = doc(this.firestore, this._collection, carreraId);
        return updateDoc(docRef, {
            estado: 'Abierto',
            vehiculoIdAprobado: null,
            datosConductorAprobado: null,
            seleccionadoId: 'Sin seleccionar'
        });
    }

    async deleteCarrera(carreraId: string) {
        console.log('[CarreraService] deleteCarrera →', { carreraId });
        const docRef = doc(this.firestore, this._collection, carreraId);
        return deleteDoc(docRef);
    }

    async finalizarCarrera(carreraId: string, vehiculoId?: string) {
        console.log('[CarreraService] finalizarCarrera →', { carreraId, vehiculoId });
        const docRef = doc(this.firestore, this._collection, carreraId);
        await updateDoc(docRef, {
            estado: 'Finalizada'
        });
        if (vehiculoId) {
            return this.vehiculoService.updateStatus(vehiculoId, 'Activo');
        }
        return;
    }
}
