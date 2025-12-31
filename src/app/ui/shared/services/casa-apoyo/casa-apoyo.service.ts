import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, deleteDoc, doc, updateDoc, query, where, arrayUnion, arrayRemove } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { BaseModel } from '../../../../models/base/base.model';
import { CasaApoyoModel } from '../../../../models/casa-apoyo/casa-apoyo.model';
import { environment } from '../../../../../enviroments';

@Injectable({
    providedIn: 'root'
})
export class CasaApoyoService {
    private _collection: string = environment.collections.casasApoyo;

    constructor(private readonly firestore: Firestore) { }

    createCasaApoyo(casa: BaseModel<CasaApoyoModel>) {
        const collectionRef = collection(this.firestore, this._collection);
        return addDoc(collectionRef, casa);
    }

    getCasasApoyo(): Observable<BaseModel<CasaApoyoModel>[]> {
        const collectionRef = collection(this.firestore, this._collection);
        return collectionData(collectionRef, { idField: 'id' }) as Observable<BaseModel<CasaApoyoModel>[]>;
    }

    deleteCasaApoyo(id: string): Promise<void> {
        const docRef = doc(this.firestore, this._collection, id);
        return deleteDoc(docRef);
    }

    assignResponsable(casaId: string, responsableId: string, responsableNombre: string, responsableCedula: string): Promise<void> {
        const docRef = doc(this.firestore, this._collection, casaId);
        return updateDoc(docRef, {
            'data.responsableId': responsableId,
            'data.responsableNombre': responsableNombre,
            'data.responsableCedula': responsableCedula,
            'data.updatedAt': new Date()
        });
    }

    getCasaApoyoByDireccion(direccion: string) {
        const q = query(collection(this.firestore, this._collection), where('data.direccion', '==', direccion));
        return collectionData(q, { idField: 'id' }) as Observable<BaseModel<CasaApoyoModel>[]>;
    }

    getCasasApoyoByIglesia(iglesiaId: string) {
        // Keeping this for backward compatibility if needed, though getCasasApoyoAprobadasByIglesia is preferred for the list
        const q = query(collection(this.firestore, this._collection), where('data.iglesiaId', '==', iglesiaId));
        return collectionData(q, { idField: 'id' }) as Observable<BaseModel<CasaApoyoModel>[]>;
    }

    getCasasApoyoAprobadasByIglesia(iglesiaId: string) {
        const q = query(
            collection(this.firestore, this._collection),
            where('data.iglesiaId', '==', iglesiaId),
            where('data.aprobado', '==', true)
        );
        return collectionData(q, { idField: 'id' }) as Observable<BaseModel<CasaApoyoModel>[]>;
    }

    // Better method name for clarity if we are passing user ID
    getCasasApoyoByResponsable(uid: string) {
        const q = query(collection(this.firestore, this._collection), where('data.responsableId', '==', uid));
        return collectionData(q, { idField: 'id' }) as Observable<BaseModel<CasaApoyoModel>[]>;
    }

    addVehiculoToCasa(casaId: string, vehiculo: any): Promise<void> {
        const docRef = doc(this.firestore, this._collection, casaId);
        return updateDoc(docRef, {
            'data.vehiculos': arrayUnion(vehiculo),
            'data.updatedAt': new Date()
        });
    }

    removeVehiculoFromCasa(casaId: string, vehiculo: any): Promise<void> {
        const docRef = doc(this.firestore, this._collection, casaId);
        return updateDoc(docRef, {
            'data.vehiculos': arrayRemove(vehiculo),
            'data.updatedAt': new Date()
        });
    }

    updateCasaApoyo(id: string, data: CasaApoyoModel): Promise<void> {
        const docRef = doc(this.firestore, this._collection, id);
        return updateDoc(docRef, {
            data: data
        });
    }
}
