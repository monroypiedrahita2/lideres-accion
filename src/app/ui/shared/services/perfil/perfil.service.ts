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
import { PerfilModel } from '../../../../models/perfil/perfil.model';

@Injectable({ providedIn: 'root' })
export class PerfilService {
  _collection: string = environment.collections.perfil;


  constructor(
    private readonly firestore: Firestore,
    private readonly toast: ToastrService,
  ) {}

  crearPerfilConUId(data: PerfilModel, id: string): Promise<void> {
    const dataRef = doc(this.firestore, this._collection, id);
    return setDoc(dataRef, data);
  }



  getPerfiles(): Observable<PerfilModel[]> {
    const _collection = collection(this.firestore, this._collection);
    return collectionData(_collection, { idField: 'id' }) as Observable<any>;
  }




  getPerfilByEmailoCC(value: string){
    if(value.includes('@')){
    const q = query(collection(this.firestore, this._collection), where('email', '==', value));
    const response = collectionData(q, { idField: 'id' }) as Observable<any[]>;
    return response;
    } else {
      const q = query(collection(this.firestore, this._collection), where('documento', '==', value));
      const response = collectionData(q, { idField: 'id' }) as Observable<any[]>;
      return response;
    }
  }
  getPerfilesByIglesia(value: string){
    const q = query(collection(this.firestore, this._collection), where('iglesia', '==', value));
    const response = collectionData(q, { idField: 'id' }) as Observable<PerfilModel[]>;
    return response;

  }





getMiPerfil(id: string): Promise<any> {
  const docRef = doc(this.firestore, this._collection, id);
  return getDoc(docRef).then((docSnap) => {
    if (docSnap.exists()) {
      return docSnap.data() as any;
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
      this.toast.success('Error al eliminar el perfil');
      console.error(error);
    }
  }

  updatePerfil(id: string, newData: any) {
    const document = doc(this.firestore, this._collection, id);
    return updateDoc(document, { ...newData });
  }
}
