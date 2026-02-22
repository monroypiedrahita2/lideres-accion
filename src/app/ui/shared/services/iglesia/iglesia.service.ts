import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, doc, getDoc, query, where } from '@angular/fire/firestore';
import { IglesiaModel } from '../../../../models/iglesia/iglesia.model';
import { Observable } from 'rxjs';
import { BaseModel } from '../../../../models/base/base.model';
import { environment } from '../../../../../environment';

@Injectable({
  providedIn: 'root'
})
export class IglesiaService {
  _collection: string = environment.collections.iglesias


  constructor(private readonly firestore: Firestore) { }

  createIglesia(iglesia: BaseModel<IglesiaModel>) {
    console.log('[IglesiaService] createIglesia →', { iglesia });
    const collectionRef = collection(this.firestore, this._collection);
    return addDoc(collectionRef, iglesia);
  }

  getIglesias() {
    console.log('[IglesiaService] getIglesias → (all)');
    const collectionRef = collection(this.firestore, this._collection);
    return collectionData(collectionRef, { idField: 'id' }) as Observable<BaseModel<IglesiaModel>[]>;
  }

  getIglesiaByDepartamento(value: string) {
    console.log('[IglesiaService] getIglesiaByDepartamento →', { departamento: value });
    const q = query(collection(this.firestore, this._collection), where('data.departamento', '==', value));
    const response = collectionData(q, { idField: 'id' }) as Observable<BaseModel<IglesiaModel>[]>;
    return response;
  }

  getMyIglesia(id: string): Promise<any> {
    console.log('[IglesiaService] getMyIglesia →', { id });
    const docRef = doc(this.firestore, this._collection, id);
    return getDoc(docRef).then((docSnap) => {
      if (docSnap.exists()) {
        return docSnap.data() as any;
      } else {
        throw new Error('No existe o es nuevo');
      }
    });
  }

  updateIglesia(id: string, iglesia: BaseModel<IglesiaModel>) {
    console.log('[IglesiaService] updateIglesia →', { id, iglesia });
    const docRef = doc(this.firestore, this._collection, id);
    return import('@angular/fire/firestore').then(({ updateDoc }) => {
      return updateDoc(docRef, { ...iglesia });
    });
  }
}
