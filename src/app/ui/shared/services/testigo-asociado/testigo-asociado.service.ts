import { Injectable } from '@angular/core';
import {
    collection,
    collectionData,
    deleteDoc,
    doc,
    Firestore,
    query,
    setDoc,
    updateDoc,
    where,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environment';
import { BaseModel } from '../../../../models/base/base.model';
import { TestigoAsociadoModel } from '../../../../models/testigo-asociado/testigo-asociado.model';

@Injectable({ providedIn: 'root' })
export class TestigoAsociadoService {
    _collection: string = environment.collections.testigosAsociados;

    constructor(private readonly firestore: Firestore) { }

    crearTestigoAsociado(
        data: BaseModel<TestigoAsociadoModel>
    ): Promise<void> {
        console.log('[TestigoAsociadoService] crearTestigoAsociado →', { data });
        const id = doc(collection(this.firestore, this._collection)).id;
        const dataRef = doc(this.firestore, this._collection, id);
        return setDoc(dataRef, data);
    }

    getTestigosByCoordinador(
        coordinadorId: string
    ): Observable<BaseModel<TestigoAsociadoModel>[]> {
        console.log('[TestigoAsociadoService] getTestigosByCoordinador →', { coordinadorId });
        const q = query(
            collection(this.firestore, this._collection),
            where('data.coordinadorId', '==', coordinadorId)
        );
        return collectionData(q, { idField: 'id' }) as Observable<any[]>;
    }

    async deleteTestigoAsociado(id: string) {
        console.log('[TestigoAsociadoService] deleteTestigoAsociado →', { id });
        const docRef = doc(this.firestore, `${this._collection}/${id}`);
        await deleteDoc(docRef);
    }

    updateTestigoAsociado(id: string, newData: BaseModel<TestigoAsociadoModel>) {
        console.log('[TestigoAsociadoService] updateTestigoAsociado →', { id, newData });
        const document = doc(this.firestore, this._collection, id);
        return updateDoc(document, { ...newData });
    }
}
