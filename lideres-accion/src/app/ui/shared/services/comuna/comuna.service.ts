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
  _collection: string = environment.collections.comunas

  constructor(private firestore: Firestore) { }



  createComuna(comuna: BaseModel<ComunaModel>,
     responsableId: string) {
    const collectionRef = collection(this.firestore, this._collection);
    const responsableRef = doc(this.firestore, `Perfiles/${responsableId}`);
    const comunaData: BaseModel<ComunaModel> = {
      ...comuna,
      data: {
        ...comuna.data,
        responsable: responsableRef
      }
    };

    return addDoc(collectionRef, comunaData);
  }

  getComunas() {
    const collectionRef = collection(this.firestore, this._collection);
    return collectionData(collectionRef, { idField: 'id' }) as Observable<BaseModel<ComunaModel>[]>;
  }

  getComunaByDepartamento(value: number) {
    const q = query(collection(this.firestore, this._collection), where('data.municipio_id.id', '==', value));
    const response = collectionData(q, { idField: 'id' }) as Observable<BaseModel<ComunaModel>[]>;
    return response;
  }


}
