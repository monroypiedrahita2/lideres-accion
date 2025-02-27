import { Injectable } from '@angular/core';
import {
  addDoc,
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
import { BaseModel } from '../../../../models/base/base.model';
import { UsuarioModel } from '../../../../models/usuarios/usuario.model';
import { AuthService } from '../auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { SelectOptionModel } from '../../../../models/base/select-options.model';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../../enviroments';

@Injectable({ providedIn: 'root' })
export class PerfilService {
  _collection: string = environment.collections.perfiles;

  constructor(
    private firestore: Firestore,
    private toast: ToastrService,
  ) {}

  crearPerfilConUId(data: UsuarioModel, id: string): Promise<void> {
    const dataRef = doc(this.firestore, this._collection, id);
    return setDoc(dataRef, data);
  }



  getPerfiles(): Observable<any> {
    const _collection = collection(this.firestore, this._collection);
    return collectionData(_collection, { idField: 'id' }) as Observable<any>;
  }



  getPerfilByEmailoCC(value: string){
    if(value.includes('@')){
    const q = query(collection(this.firestore, this._collection), where('email', '==', value));
    const response = collectionData(q, { idField: 'id' }) as Observable<UsuarioModel[]>;
    return response;
    } else {
      const q = query(collection(this.firestore, this._collection), where('documento', '==', value));
      const response = collectionData(q, { idField: 'id' }) as Observable<UsuarioModel[]>;
      return response;
    }
  }




getMiPerfil(id: string): Promise<UsuarioModel> {
  const docRef = doc(this.firestore, this._collection, id);
  return getDoc(docRef).then((docSnap) => {
    if (docSnap.exists()) {
      return docSnap.data() as UsuarioModel;
    } else {
      throw new Error('No existe o es nuevo');
    }
  });
}

  async deleteperfil(id: string) {
    const docRef = doc(this.firestore, `${this._collection}/${id}`);
    try {
      await deleteDoc(docRef);
      this.toast.success('perfil eliminado correctamente');
    } catch (error) {
      console.log(error);
      this.toast.success('Error al eliminar el perfil');
    }
  }

  async updateperfilId(id: string, data: any) {
    const docRef = doc(this.firestore, `${this._collection}/${id}`);
    await updateDoc(docRef, data);
  }

  updatePerfil(uid: string, data: any) {
    const document = doc(this.firestore, this._collection, uid);
    return updateDoc(document, data);

  }

  updateDoc(id: string, newData: UsuarioModel) {
    const document = doc(this.firestore, this._collection, id);
    return updateDoc(document, { ...newData });
  }
}
