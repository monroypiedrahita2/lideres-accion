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
import { UsuarioModel } from '../../../../models/usuarios/usuario.model';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { environment } from '../../../../../enviroments';

@Injectable({ providedIn: 'root' })
export class LiderService {
  _collection: string = environment.production ? environment.collections.lideres : environment.collectionsDev.lideres;

  constructor(private firestore: Firestore, private toast: ToastrService) {}

  crearLiderConIdDocumento(data: BaseModel<UsuarioModel>, id: string): Promise<void> {
    const dataRef = doc(this.firestore, this._collection, id);
    return setDoc(dataRef, data);
  }

  getLideres(): Observable<any> {
    const _collection = collection(this.firestore, this._collection);
    return collectionData(_collection, { idField: 'id' }) as Observable<any>;
  }

  getLiderByEmailoCC(value: string) {
    if (value.includes('@')) {
      const q = query(
        collection(this.firestore, this._collection),
        where('email', '==', value)
      );
      const response = collectionData(q, { idField: 'id' }) as Observable<
        UsuarioModel[]
      >;
      return response;
    } else {
      const q = query(
        collection(this.firestore, this._collection),
        where('documento', '==', value)
      );
      const response = collectionData(q, { idField: 'id' }) as Observable<
        UsuarioModel[]
      >;
      return response;
    }
  }

  getLider(id: string): Promise<UsuarioModel> {
    const docRef = doc(this.firestore, this._collection, id);
    return getDoc(docRef).then((docSnap) => {
      if (docSnap.exists()) {
        return docSnap.data() as UsuarioModel;
      } else {
        throw new Error('No existe o permisos insuficientes');
      }
    });
  }

  async deleteLider(id: string) {
    const docRef = doc(this.firestore, `${this._collection}/${id}`);
    try {
      await deleteDoc(docRef);
      this.toast.success('perfil eliminado correctamente');
    } catch (error) {
      console.log(error);
      this.toast.success('Error al eliminar el perfil');
    }
  }

  updateLider(id: string, newData: UsuarioModel) {
    const document = doc(this.firestore, this._collection, id);
    return updateDoc(document, { ...newData });
  }
}
