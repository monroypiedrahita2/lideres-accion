import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, doc, docData, getDoc, query, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { BaseModel } from '../../../../models/base/base.model';
import { environment } from '../../../../../enviroments';
import { ComunaModel } from '../../../../models/referidos/referido.model';

@Injectable({
  providedIn: 'root'
})
export class ComunaService {
  _collection: string = environment.collections.comunas

  constructor(private firestore: Firestore) { }

  createComuna(Comuna: BaseModel<ComunaModel>) {
    const collectionRef = collection(this.firestore, this._collection);
    return addDoc(collectionRef, Comuna);
  }

  getComunas() {
    const collectionRef = collection(this.firestore, this._collection);
    return collectionData(collectionRef, { idField: 'id' }) as Observable<BaseModel<ComunaModel>[]>;
  }

  getComunaByDepartamento(value: number) {
    const q = query(collection(this.firestore, this._collection), where('data.departamento.id', '==', value));
    const response = collectionData(q, { idField: 'id' }) as Observable<BaseModel<ComunaModel>[]>;
    return response;
  }


}
