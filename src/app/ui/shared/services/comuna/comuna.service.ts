import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, doc, query, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { BaseModel } from '../../../../models/base/base.model';
import { environment } from '../../../../../enviroments';
import { ComunaModel } from '../../../../models/comuna/comuna.model';

@Injectable({
  providedIn: 'root'
})
export class ComunaService {
  _collection: string = environment.collections.comunas;

  constructor(private readonly firestore: Firestore) { }



  createComuna(comuna: BaseModel<ComunaModel>) {
    const collectionRef = collection(this.firestore, this._collection);
    return addDoc(collectionRef, comuna);
  }

  getComunas() {
    const collectionRef = collection(this.firestore, this._collection);
    return collectionData(collectionRef, { idField: 'id' }) as Observable<BaseModel<ComunaModel>[]>;
  }

  getComunaByMunicipio(value: string) {
    const q = query(collection(this.firestore, this._collection), where('data.municipio', '==', value));
    const response = collectionData(q, { idField: 'id' }) as Observable<BaseModel<ComunaModel>[]>;
    return response;
  }


}
