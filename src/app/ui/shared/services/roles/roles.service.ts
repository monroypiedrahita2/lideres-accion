import { Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  query,
  setDoc,
  where,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { BaseModel } from '../../../../models/base/base.model';
import { environment } from '../../../../../environment';
import { RolesModel } from '../../../../models/roles/roles.model';

@Injectable({
  providedIn: 'root',
})
export class RolesService {
  _collection: string = environment.collections.roles;

  constructor(private readonly firestore: Firestore) { }

  createRole(data: any, id: string): Promise<void> {
    console.log('[RolesService] createRole →', { id, data });
    const dataRef = doc(this.firestore, this._collection, id);
    return setDoc(dataRef, data);
  }

  getRoles() {
    console.log('[RolesService] getRoles → (all)');
    const collectionRef = collection(this.firestore, this._collection);
    return collectionData(collectionRef, { idField: 'id' }) as Observable<
      RolesModel[]
    >;
  }

  async deleteRole(id: string) {
    console.log('[RolesService] deleteRole →', { id });
    const docRef = doc(this.firestore, `${this._collection}/${id}`);
    await deleteDoc(docRef);
  }




}
