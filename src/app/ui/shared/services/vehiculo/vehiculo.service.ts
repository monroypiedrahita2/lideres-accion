import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, doc, getDoc, query, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { BaseModel } from '../../../../models/base/base.model';
import { environment } from '../../../../../enviroments';
import { VehiculoModel } from '../../../../models/vehiculo/vehiculo.model';

@Injectable({
  providedIn: 'root'
})
export class VehiculoService {
  _collection: string = environment.collections.vehiculos

  constructor(private readonly firestore: Firestore) { }

  createVehiculo(vehiculo: VehiculoModel) {
    const collectionRef = collection(this.firestore, this._collection);
    return addDoc(collectionRef, vehiculo);
  }


  getVehiculos() {
    const collectionRef = collection(this.firestore, this._collection);
    return collectionData(collectionRef, { idField: 'id' }) as Observable<BaseModel<VehiculoModel>[]>;
  }

  getVehiculoByPlaca(value: string) {
    const q = query(collection(this.firestore, this._collection), where('data.placa', '==', value));
    const response = collectionData(q, { idField: 'id' }) as Observable<BaseModel<VehiculoModel>[]>;
    return response;
  }

  getMyVehiculo(id: string): Promise<any> {
    const docRef = doc(this.firestore, this._collection, id);
    return getDoc(docRef).then((docSnap) => {
      if (docSnap.exists()) {
        return docSnap.data() as any;
      } else {
        throw new Error('No existe o es nuevo');
      }
    });
  }

}

