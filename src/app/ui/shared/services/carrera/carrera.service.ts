import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, doc, setDoc, query, where, collectionData, updateDoc, arrayUnion, arrayRemove, deleteDoc } from '@angular/fire/firestore';
import { CreateCarreraModel } from '../../../../models/carrera/carrera.model';
import { environment } from '../../../../../enviroments';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CarreraService {
    _collection: string = environment.collections.carreras;

    constructor(private readonly firestore: Firestore) { }

    createCarrera(carrera: CreateCarreraModel) {
        const collectionRef = collection(this.firestore, this._collection);
        return addDoc(collectionRef, carrera);
    }

    getCarrerasCreadasPor(uid: string) {
        const q = query(
            collection(this.firestore, this._collection),
            where('creadaPor', '==', uid)
        );
        return collectionData(q, { idField: 'id' }) as Observable<CreateCarreraModel[]>;
    }

    getCarrerasAsignadasAVehiculo(vehiculoId: string) {
        const q = query(
            collection(this.firestore, this._collection),
            where('vehiculoIdAprobado', '==', vehiculoId)
        );
        return collectionData(q, { idField: 'id' }) as Observable<CreateCarreraModel[]>;
    }

    getCarrerasDisponibles(tipoVehiculo: string | string[]) {
        let q;
        if (Array.isArray(tipoVehiculo)) {
            q = query(
                collection(this.firestore, this._collection),
                where('estado', '==', 'Abierto'),
                where('tipoVehiculo', 'in', tipoVehiculo) // Use 'in' for arrays
            );
        } else {
            q = query(
                collection(this.firestore, this._collection),
                where('estado', '==', 'Abierto'),
                where('tipoVehiculo', '==', tipoVehiculo)
            );
        }

        return collectionData(q, { idField: 'id' }) as Observable<CreateCarreraModel[]>;
    }

    async postularse(carreraId: string, postulacion: any) {
        const docRef = doc(this.firestore, this._collection, carreraId);
        return updateDoc(docRef, {
            postulados: arrayUnion(postulacion)
        });
    }

    async aprobarConductor(carreraId: string, vehiculoId: string, conductorId: string, datosConductor?: any) {
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
        const docRef = doc(this.firestore, this._collection, carreraId);
        return updateDoc(docRef, {
            postulados: arrayRemove(postulacion) // Requires arrayRemove import
        });
    }

    async eliminarVehiculoSeleccionado(carreraId: string) {
        const docRef = doc(this.firestore, this._collection, carreraId);
        return updateDoc(docRef, {
            estado: 'Abierto',
            vehiculoIdAprobado: null,
            datosConductorAprobado: null,
            seleccionadoId: 'Sin seleccionar'
        });
    }

    async deleteCarrera(carreraId: string) {
        const docRef = doc(this.firestore, this._collection, carreraId);
        return deleteDoc(docRef);
    }
    async finalizarCarrera(carreraId: string) {
        const docRef = doc(this.firestore, this._collection, carreraId);
        return updateDoc(docRef, {
            estado: 'Finalizada'
        });
    }
}
