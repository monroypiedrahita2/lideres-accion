import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, doc, getDoc, query, updateDoc, where, setDoc, deleteDoc, docData } from '@angular/fire/firestore';
import { Observable, BehaviorSubject } from 'rxjs';
import { BaseModel } from '../../../../models/base/base.model';
import { environment } from '../../../../../environment';
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

  getVehiculosByCasaApoyo(casaApoyoId: string) {
    const q = query(collection(this.firestore, this._collection), where('casaApoyoId', '==', casaApoyoId));
    return collectionData(q, { idField: 'id' }) as Observable<VehiculoModel[]>;
  }

  getVehiculosAprobadosSinCasaByIglesia(iglesiaId: string) {
    const q = query(
      collection(this.firestore, this._collection),
      where('iglesiaId', '==', iglesiaId),
      where('aprobado', '==', true),
      where('casaApoyoId', '==', null)
    );
    return collectionData(q, { idField: 'id' }) as Observable<VehiculoModel[]>;
  }

  getVehiculosAprobadosByIglesia(iglesiaId: string) {
    const q = query(
      collection(this.firestore, this._collection),
      where('iglesiaId', '==', iglesiaId),
      where('aprobado', '==', true)
    );
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

  getVehiculoById(id: string) {
    const docRef = doc(this.firestore, this._collection, id);
    return docData(docRef, { idField: 'id' }) as Observable<VehiculoModel>;
  }



  updateVehiculo(id: string, newData: VehiculoModel) {
    const document = doc(this.firestore, this._collection, id);
    return updateDoc(document, { ...newData });
  }

  async deleteVehiculo(id: string) {
    const docRef = doc(this.firestore, `${this._collection}/${id}`);
    await deleteDoc(docRef);
  }

  private currentVehiculoSubject = new BehaviorSubject<VehiculoModel | null>(null);
  currentVehiculo$ = this.currentVehiculoSubject.asObservable();

  setCurrentVehiculo(vehiculo: VehiculoModel | null) {
    this.currentVehiculoSubject.next(vehiculo);
  }

  loadVehiculo(uid: string) {
    this.getVehiculoByConductor(uid).subscribe(vehiculos => {
      if (vehiculos && vehiculos.length > 0) {
        this.setCurrentVehiculo(vehiculos[0]);
      } else {
        this.setCurrentVehiculo(null);
      }
    });
  }

  get currentVehiculoValue(): VehiculoModel | null {
    return this.currentVehiculoSubject.value;
  }
}

