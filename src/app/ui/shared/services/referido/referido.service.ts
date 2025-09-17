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
} from '@angular/fire/firestore';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { environment } from '../../../../../enviroments';
import { ReferidoModel } from '../../../../models/referido/referido.model';

@Injectable({ providedIn: 'root' })
export class ReferidoService {
  _collection: string = environment.collections.referidos;

  constructor(
    private readonly firestore: Firestore,
    private readonly toast: ToastrService
  ) {}

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
  getMyReferidos(uid: string): Observable<BaseModel<ReferidoModel>[]> {
    const q = query(
      collection(this.firestore, this._collection),
      where('data.referidoPor', '==', uid)
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

  updateReferido(id: string, newData: any) {
    const document = doc(this.firestore, this._collection, id);
    return updateDoc(document, { ...newData });
  }
}
