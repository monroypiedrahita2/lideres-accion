import { BaseModel } from '../../../../models/base/base.model';
import { Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  getDoc,
  query,
  setDoc,
  updateDoc,
  where,
  and,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { environment } from '../../../../../enviroments';
import { ReferidoModel } from '../../../../models/referido/referido.model';

@Injectable({ providedIn: 'root' })
export class ReferidoService {
  _collection: string = environment.collections.referidos;

  constructor(private readonly firestore: Firestore) {}

  crearReferidoConIdDocumento(
    data: BaseModel<ReferidoModel>,
    id: string
  ): Promise<void> {
    const dataRef = doc(this.firestore, this._collection, id);
    return setDoc(dataRef, data);
  }

  async existeReferido(documento: string): Promise<boolean> {
    const docRef = doc(this.firestore, this._collection, documento);
    return getDoc(docRef).then((docSnap) => {
      if (docSnap.exists()) {
        return true;
      } else {
        return false;
      }
    });
  }

  getReferidos(): Observable<any> {
    const _collection = collection(this.firestore, this._collection);
    return collectionData(_collection, { idField: 'id' }) as Observable<any>;
  }

  meReferido(documento: string) {
    const q = query(
      collection(this.firestore, this._collection),
      where('email', '==', documento)
    );
    const response = collectionData(q, { idField: 'id' }) as Observable<any[]>;
    return response;
  }
  getReferidoBySearch(criterio: string, value: string  | boolean) {
    const q = query(
      collection(this.firestore, this._collection),
      where(criterio, '==', value)
    );
    const response = collectionData(q, { idField: 'id' }) as Observable<any[]>;
    return response;
  }

  getReferidoByDocument(value: string) {
    const docRef = doc(this.firestore, this._collection, value);
    return getDoc(docRef).then((docSnap) => {
      if (docSnap.exists()) {
        return docSnap.data() as any;
      } else {
        throw new Error('No existe o es nuevo');
      }
    });
  }


  getReferidoByIglesia(
    iglesia: string
  ): Observable<BaseModel<ReferidoModel>[]> {
    const q = query(
      collection(this.firestore, this._collection),
      where('data.iglesia', '==', iglesia)
    );
    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  }
  getTestigos(iglesia: string): Observable<BaseModel<ReferidoModel>[]> {
    const q = query(
      collection(this.firestore, this._collection),
      where('data.iglesia', '==', iglesia),
      where(
        'data.testigo.quiereApoyar',
        '==',
        true
      )
    );
    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  }
  getReferidoByDocumentoAndIlgesia(documento: string, iglesia: string): Observable<BaseModel<ReferidoModel>[]> {
    const q = query(
      collection(this.firestore, this._collection),
      where('data.iglesia', '==', iglesia),
      where(
        'id',
        '==',
        documento
      )
    );
    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  }
  getMyReferidos(id: string): Observable<BaseModel<ReferidoModel>[]> {
    const q = query(
      collection(this.firestore, this._collection),
      where('data.referidoPor', '==', id)
    );
    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  }

  getReferido(id: string): Promise<any> {
    const docRef = doc(this.firestore, this._collection, id);
    return getDoc(docRef).then((docSnap) => {
      if (docSnap.exists()) {
        return docSnap.data() as any;
      } else {
        throw new Error('No existe o permisos insuficientes');
      }
    });
  }

  async deleteReferido(id: string) {
    const docRef = doc(this.firestore, `${this._collection}/${id}`);
    await deleteDoc(docRef);
  }

  updateReferido(id: string, newData: BaseModel<ReferidoModel>) {
    const document = doc(this.firestore, this._collection, id);
    return updateDoc(document, { ...newData });
  }
}
