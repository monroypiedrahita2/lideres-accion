import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, doc, setDoc, query, where, collectionData, updateDoc, arrayUnion } from '@angular/fire/firestore';
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

    getCarrerasDisponibles(tipoVehiculo: string) {
        const q = query(
            collection(this.firestore, this._collection),
            where('estado', '==', 'Abierto'),
            where('tipoVehiculo', '==', tipoVehiculo)
        );
        return collectionData(q, { idField: 'id' }) as Observable<CreateCarreraModel[]>;
    }

    async postularse(carreraId: string, postulacion: any) {
        const docRef = doc(this.firestore, this._collection, carreraId);
        return updateDoc(docRef, {
            postulados: arrayUnion(postulacion)
        });
    }

    async aprobarConductor(carreraId: string, vehiculoId: string, conductorId: string) { // conductorId might be needed if logic changes, but for now vehiculoId is key
        const docRef = doc(this.firestore, this._collection, carreraId);
        return updateDoc(docRef, {
            vehiculoIdAprobado: vehiculoId,
            seleccionadoId: vehiculoId, // or specific driver ID if logic dictates
            estado: 'En ruta'
        });
    }
}
