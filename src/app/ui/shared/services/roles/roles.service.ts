import { Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  doc,
  Firestore,
  query,
  setDoc,
  where,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { BaseModel } from '../../../../models/base/base.model';
import { environment } from '../../../../../enviroments';
import { RolesModel } from '../../../../models/roles/roles.model';

@Injectable({
  providedIn: 'root',
})
export class RolesService {
  _collection: string = environment.collections.roles;

  constructor(private readonly firestore: Firestore) {}

  createRole(data: any, id: string): Promise<void> {
    const dataRef = doc(this.firestore, this._collection, id);
    return setDoc(dataRef, data);
  }

  getRoles() {
    const collectionRef = collection(this.firestore, this._collection);
    return collectionData(collectionRef, { idField: 'id' }) as Observable<
      BaseModel<RolesModel>[]
    >;
  }

  getRoleByName(value: string) {
    const q = query(
      collection(this.firestore, this._collection),
      where('data.nombre', '==', value)
    );
    const response = collectionData(q, { idField: 'id' }) as Observable<
      BaseModel<RolesModel>[]
    >;
    return response;
  }
}
