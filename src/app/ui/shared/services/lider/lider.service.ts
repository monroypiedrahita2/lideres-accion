import { BaseModel } from './../../../../models/base/base.model';
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
import { environment } from '../../../../../environment';

@Injectable({ providedIn: 'root' })
export class LiderService {
  _collection: string = environment.collections.lideres

  constructor(private readonly firestore: Firestore, private readonly toast: ToastrService) { }

  crearLiderConIdDocumento(data: BaseModel<any>, id: string): Promise<void> {
    console.log('[LiderService] crearLiderConIdDocumento →', { id, data });
    const dataRef = doc(this.firestore, this._collection, id);
    return setDoc(dataRef, data);
  }

  getLideres(): Observable<any> {
    console.log('[LiderService] getLideres → (all)');
    const _collection = collection(this.firestore, this._collection);
    return collectionData(_collection, { idField: 'id' }) as Observable<any>;
  }

  getLiderByEmailoCC(value: string) {
    console.log('[LiderService] getLiderByEmailoCC →', { value });
    if (value.includes('@')) {
      const q = query(
        collection(this.firestore, this._collection),
        where('email', '==', value)
      );
      const response = collectionData(q, { idField: 'id' }) as Observable<any[]>;
      return response;
    } else {
      const q = query(
        collection(this.firestore, this._collection),
        where('documento', '==', value)
      );
      const response = collectionData(q, { idField: 'id' }) as Observable<any[]>;
      return response;
    }
  }

  getLider(id: string): Promise<any> {
    console.log('[LiderService] getLider →', { id });
    const docRef = doc(this.firestore, this._collection, id);
    return getDoc(docRef).then((docSnap) => {
      if (docSnap.exists()) {
        return docSnap.data() as any;
      } else {
        throw new Error('No existe o permisos insuficientes');
      }
    });
  }

  async deleteLider(id: string) {
    console.log('[LiderService] deleteLider →', { id });
    const docRef = doc(this.firestore, `${this._collection}/${id}`);
    try {
      await deleteDoc(docRef);
      this.toast.success('perfil eliminado correctamente');
    } catch (error) {
      console.error(error);
      this.toast.success('Error al eliminar el perfil');
    }
  }

  updateLider(id: string, newData: any) {
    console.log('[LiderService] updateLider →', { id, newData });
    const document = doc(this.firestore, this._collection, id);
    return updateDoc(document, { ...newData });
  }
}
