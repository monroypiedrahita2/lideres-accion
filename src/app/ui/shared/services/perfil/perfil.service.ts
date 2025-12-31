import { Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  getDoc,
  query,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../../../enviroments';
import { AsigmentRolePerfilModel, PerfilModel } from '../../../../models/perfil/perfil.model';

@Injectable({ providedIn: 'root' })
export class PerfilService {
  _collection: string = environment.collections.perfil;


  private currentUserSubject: BehaviorSubject<PerfilModel | null>;
  public currentUser$: Observable<PerfilModel | null>;


  constructor(
    private readonly firestore: Firestore,
    private readonly toast: ToastrService,
  ) {
    const savedUser = localStorage.getItem('usuario');
    this.currentUserSubject = new BehaviorSubject<PerfilModel | null>(savedUser ? JSON.parse(savedUser) : null);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): PerfilModel | null {
    return this.currentUserSubject.value;
  }

  public setCurrentUser(user: PerfilModel) {
    this.currentUserSubject.next(user);
  }

  crearPerfilConUId(data: PerfilModel, id: string): Promise<void> {
    const dataRef = doc(this.firestore, this._collection, id);
    return setDoc(dataRef, data);
  }

  getPerfilByDocumento(value: string) {
    const q = query(collection(this.firestore, this._collection), where('documento', '==', value));
    const response = collectionData(q, { idField: 'id' }) as Observable<any[]>;
    return response;
  }



  getPerfiles(): Observable<PerfilModel[]> {
    const _collection = collection(this.firestore, this._collection);
    return collectionData(_collection, { idField: 'id' }) as Observable<any>;
  }

  getPostuladosTestigos(): Observable<PerfilModel[]> {
    const q = query(
      collection(this.firestore, this._collection),
      where('postulado.testigo', '==', true)
    );
    return collectionData(q, { idField: 'id' }) as Observable<PerfilModel[]>;
  }




  getPerfilByEmailoCC(value: string) {
    if (value.includes('@')) {
      const q = query(collection(this.firestore, this._collection), where('email', '==', value));
      const response = collectionData(q, { idField: 'id' }) as Observable<any[]>;
      return response;
    } else {
      const q = query(collection(this.firestore, this._collection), where('documento', '==', value));
      const response = collectionData(q, { idField: 'id' }) as Observable<any[]>;
      return response;
    }
  }
  getPerfilesByIglesia(value: string) {
    const q = query(collection(this.firestore, this._collection), where('iglesia', '==', value));
    const response = collectionData(q, { idField: 'id' }) as Observable<PerfilModel[]>;
    return response;

  }

  getPostuladosCasasApoyoByIglesia(iglesiaId: string) {
    const q = query(
      collection(this.firestore, this._collection),
      where('iglesia', '==', iglesiaId),
      where('postulado.casaApoyo', '==', true)
    );
    const response = collectionData(q, { idField: 'id' }) as Observable<PerfilModel[]>;
    return response;
  }





  getMiPerfil(id: string): Promise<any> {
    const docRef = doc(this.firestore, this._collection, id);
    return getDoc(docRef).then((docSnap) => {
      if (docSnap.exists()) {
        return docSnap.data() as any;
      } else {
        throw new Error('No existe o es nuevo');
      }
    });
  }

  async deleteperfil(id: string) {
    const docRef = doc(this.firestore, `${this._collection}/${id}`);
    try {
      await deleteDoc(docRef);
      this.toast.success('perfil eliminado correctamente');
    } catch (error) {
      this.toast.success('Error al eliminar el perfil');
      console.error(error);
    }
  }

  updatePerfil(id: string, newData: AsigmentRolePerfilModel) {
    const document = doc(this.firestore, this._collection, id);
    return updateDoc(document, { ...newData });
  }

  updateIglesia(id: string, iglesiaId: string) {
    const document = doc(this.firestore, this._collection, id);
    return updateDoc(document, { iglesia: iglesiaId });
  }
}
