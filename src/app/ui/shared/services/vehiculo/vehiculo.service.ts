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
    console.log('[VehiculoService] createVehiculo →', { id, vehiculo });
    if (id) {
      const document = doc(this.firestore, this._collection, id);
      return setDoc(document, vehiculo);
    }
    const collectionRef = collection(this.firestore, this._collection);
    return addDoc(collectionRef, vehiculo);
  }

  getVehiculos() {
    console.log('[VehiculoService] getVehiculos → (all)');
    const collectionRef = collection(this.firestore, this._collection);
    return collectionData(collectionRef, { idField: 'id' }) as Observable<BaseModel<VehiculoModel>[]>;
  }

  getVehiculoByPlaca(value: string) {
    console.log('[VehiculoService] getVehiculoByPlaca →', { placa: value });
    const q = query(collection(this.firestore, this._collection), where('placa', '==', value));
    const response = collectionData(q, { idField: 'id' }) as Observable<BaseModel<VehiculoModel>[]>;
    return response;
  }

  getVehiculoByConductor(value: string) {
    console.log('[VehiculoService] getVehiculoByConductor →', { conductorId: value });
    const q = query(collection(this.firestore, this._collection), where('conductorId', '==', value));
    const response = collectionData(q, { idField: 'id' }) as Observable<VehiculoModel[]>;
    return response;
  }

  getVehiculosByIglesia(iglesiaId: string) {
    console.log('[VehiculoService] getVehiculosByIglesia →', { iglesiaId });
    const q = query(collection(this.firestore, this._collection), where('iglesia.id', '==', iglesiaId));
    return collectionData(q, { idField: 'id' }) as Observable<VehiculoModel[]>;
  }

  getVehiculosByCasaApoyo(casaApoyoId: string) {
    console.log('[VehiculoService] getVehiculosByCasaApoyo →', { casaApoyoId });
    const q = query(collection(this.firestore, this._collection), where('casaApoyoId', '==', casaApoyoId));
    return collectionData(q, { idField: 'id' }) as Observable<VehiculoModel[]>;
  }

  getVehiculosAprobadosSinCasaByIglesia(iglesiaId: string) {
    console.log('[VehiculoService] getVehiculosAprobadosSinCasaByIglesia →', { iglesiaId });
    const q = query(
      collection(this.firestore, this._collection),
      where('iglesia.id', '==', iglesiaId),
      where('aprobado', '==', true),
      where('casaApoyoId', '==', null)
    );
    return collectionData(q, { idField: 'id' }) as Observable<VehiculoModel[]>;
  }

  getVehiculosAprobadosByIglesia(iglesiaId: string) {
    console.log('[VehiculoService] getVehiculosAprobadosByIglesia →', { iglesiaId });
    const q = query(
      collection(this.firestore, this._collection),
      where('iglesia.id', '==', iglesiaId),
      where('aprobado', '==', true)
    );
    return collectionData(q, { idField: 'id' }) as Observable<VehiculoModel[]>;
  }

  getMyVehiculo(id: string): Promise<any> {
    console.log('[VehiculoService] getMyVehiculo →', { id });
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
    console.log('[VehiculoService] getVehiculoById →', { id });
    const docRef = doc(this.firestore, this._collection, id);
    return docData(docRef, { idField: 'id' }) as Observable<VehiculoModel>;
  }

  updateVehiculo(id: string, newData: VehiculoModel) {
    console.log('[VehiculoService] updateVehiculo →', { id, newData });
    const document = doc(this.firestore, this._collection, id);
    return updateDoc(document, { ...newData });
  }

  async deleteVehiculo(id: string) {
    console.log('[VehiculoService] deleteVehiculo →', { id });
    const docRef = doc(this.firestore, `${this._collection}/${id}`);
    await deleteDoc(docRef);
  }

  updateStatus(id: string, estado: 'Activo' | 'Inactivo' | 'En carrera') {
    console.log('[VehiculoService] updateStatus →', { id, estado });
    const document = doc(this.firestore, this._collection, id);
    return updateDoc(document, { estado });
  }

  private currentVehiculoSubject = new BehaviorSubject<VehiculoModel | null>(null);
  currentVehiculo$ = this.currentVehiculoSubject.asObservable();

  setCurrentVehiculo(vehiculo: VehiculoModel | null) {
    this.currentVehiculoSubject.next(vehiculo);
  }

  loadVehiculo(uid: string) {
    console.log('[VehiculoService] loadVehiculo →', { uid });
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
