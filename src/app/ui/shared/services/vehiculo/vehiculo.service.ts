import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, doc, getDoc, query, updateDoc, where, setDoc } from '@angular/fire/firestore';
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

  createVehiculo(vehiculo: VehiculoModel, id?: string) {
    if (id) {
      const document = doc(this.firestore, this._collection, id);
      return setDoc(document, vehiculo);
    }
    const collectionRef = collection(this.firestore, this._collection);
    return addDoc(collectionRef, vehiculo);
  }


  getVehiculos() {
    const collectionRef = collection(this.firestore, this._collection);
    return collectionData(collectionRef, { idField: 'id' }) as Observable<BaseModel<VehiculoModel>[]>;
  }

  getVehiculoByPlaca(value: string) {
    const q = query(collection(this.firestore, this._collection), where('placa', '==', value));
    const response = collectionData(q, { idField: 'id' }) as Observable<BaseModel<VehiculoModel>[]>;
    return response;
  }

  getVehiculoByConductor(value: string) {
    const q = query(collection(this.firestore, this._collection), where('conductorId', '==', value));
    const response = collectionData(q, { idField: 'id' }) as Observable<VehiculoModel[]>;
    return response;
  }

  getVehiculosByIglesia(iglesiaId: string) {
    const q = query(collection(this.firestore, this._collection), where('iglesiaId', '==', iglesiaId));
    return collectionData(q, { idField: 'id' }) as Observable<VehiculoModel[]>;
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



  updateVehiculo(id: string, newData: VehiculoModel) {
    const document = doc(this.firestore, this._collection, id);
    return updateDoc(document, { ...newData });
  }

}

