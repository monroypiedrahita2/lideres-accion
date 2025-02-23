import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, doc, docData, getDoc, query, where } from '@angular/fire/firestore';
import { IglesiaModel } from '../../../../models/iglesia/iglesia.model';
import { Observable } from 'rxjs';
import { BaseModel } from '../../../../models/base/base.model';
import { environment } from '../../../../../enviroments';

@Injectable({
  providedIn: 'root'
})
export class IglesiaService {
  _collection: string = environment.collections.iglesias

  constructor(private firestore: Firestore) { }

  createIglesia(iglesia: BaseModel<IglesiaModel>) {
    const collectionRef = collection(this.firestore, this._collection);
    return addDoc(collectionRef, iglesia);
  }

  getIglesias() {
    const collectionRef = collection(this.firestore, this._collection);
    return collectionData(collectionRef, { idField: 'id' }) as Observable<BaseModel<IglesiaModel>[]>;
  }

  getIglesiaByDepartamento(value: number) {
    const q = query(collection(this.firestore, this._collection), where('data.departamento.id', '==', value));
    const response = collectionData(q, { idField: 'id' }) as Observable<BaseModel<IglesiaModel>[]>;
    return response;
  }


}
