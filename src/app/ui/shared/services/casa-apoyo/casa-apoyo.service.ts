import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, deleteDoc, doc, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { BaseModel } from '../../../../models/base/base.model';
import { CasaApoyoModel } from '../../../../models/casa-apoyo/casa-apoyo.model';
import { environment } from '../../../../../enviroments';

@Injectable({
    providedIn: 'root'
})
export class CasaApoyoService {
    private _collection: string = 'casas-apoyo';

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
}
