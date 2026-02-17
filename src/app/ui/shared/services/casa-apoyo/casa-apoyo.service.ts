import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, deleteDoc, doc, updateDoc, query, where, arrayUnion, arrayRemove, getDoc } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { BaseModel } from '../../../../models/base/base.model';
import { CasaApoyoModel } from '../../../../models/casa-apoyo/casa-apoyo.model';
import { environment } from '../../../../../environment';

@Injectable({
    providedIn: 'root'
})
export class CasaApoyoService {
    private _collection: string = environment.collections.casasApoyo;
    private casaApoyoCache$: Observable<BaseModel<CasaApoyoModel>[]> | null = null;
    private currentUid: string | null = null;

    constructor(private readonly firestore: Firestore) { }

    createCasaApoyo(casa: BaseModel<CasaApoyoModel>) {
        const collectionRef = collection(this.firestore, this._collection);
        return addDoc(collectionRef, casa);
    }

    getCasasApoyo(): Observable<BaseModel<CasaApoyoModel>[]> {
        const collectionRef = collection(this.firestore, this._collection);
        return collectionData(collectionRef, { idField: 'id' }) as Observable<BaseModel<CasaApoyoModel>[]>;
    }

    getCasaApoyo(id: string): Promise<any> {
        const docRef = doc(this.firestore, this._collection, id);
        return getDoc(docRef).then((docSnap) => {
            if (docSnap.exists()) {
                return docSnap.data() as any;
            } else {
                return null;
            }
        });
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
        const q = query(collection(this.firestore, this._collection), where('data.iglesia.id', '==', iglesiaId));
        return collectionData(q, { idField: 'id' }) as Observable<BaseModel<CasaApoyoModel>[]>;
    }

    getCasasApoyoAprobadasByIglesia(iglesiaId: string) {
        const q = query(
            collection(this.firestore, this._collection),
            where('data.iglesia.id', '==', iglesiaId),
            where('data.aprobado', '==', true)
        );
        return collectionData(q, { idField: 'id' }) as Observable<BaseModel<CasaApoyoModel>[]>;
    }

    // Better method name for clarity if we are passing user ID
    getCasasApoyoByResponsable(uid: string) {
        if (!this.casaApoyoCache$ || this.currentUid !== uid) {
            this.currentUid = uid;
            const q = query(collection(this.firestore, this._collection), where('data.responsableId', '==', uid));
            this.casaApoyoCache$ = (collectionData(q, { idField: 'id' }) as Observable<BaseModel<CasaApoyoModel>[]>).pipe(
                shareReplay(1)
            );
        }
        return this.casaApoyoCache$;
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
