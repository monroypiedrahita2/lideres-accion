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

  getReferidos(): Observable<any> {
    const _collection = collection(this.firestore, this._collection);
    return collectionData(_collection, { idField: 'id' }) as Observable<any>;
  }

  getReferidoByEmailoCC(value: string) {
    if (value.includes('@')) {
      const q = query(
        collection(this.firestore, this._collection),
        where('email', '==', value)
      );
      const response = collectionData(q, { idField: 'id' }) as Observable<
        any[]
      >;
      return response;
    } else {
      const q = query(
        collection(this.firestore, this._collection),
        where('documento', '==', value)
      );
      const response = collectionData(q, { idField: 'id' }) as Observable<
        any[]
      >;
      return response;
    }
  }
  getReferidoByIglesia(iglesia: string): Observable<any[]> {
    const q = query(
      collection(this.firestore, this._collection),
      where('data.iglesia', '==', iglesia)
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
    try {
      await deleteDoc(docRef);
      this.toast.success('perfil eliminado correctamente');
    } catch (error) {
      console.log(error);
      this.toast.success('Error al eliminar el perfil');
    }
  }

  updateReferido(id: string, newData: any) {
    const document = doc(this.firestore, this._collection, id);
    return updateDoc(document, { ...newData });
  }
}
