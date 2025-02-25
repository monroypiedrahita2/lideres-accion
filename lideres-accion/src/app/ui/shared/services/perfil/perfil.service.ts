import { Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  getDoc,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { BaseModel } from '../../../../models/base/base.model';
import { UsuarioModel } from '../../../../models/usuarios/usuario.model';
import { AuthService } from '../auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { SelectOptionModel } from '../../../../models/base/select-options.model';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../../enviroments';
import { IglesiaModel } from '../../../../models/iglesia/iglesia.model';
import { ComunaModel } from '../../../../models/comuna/comuna.model';

@Injectable({ providedIn: 'root' })
export class PerfilService {
  _collection: string = environment.collections.perfiles;

  constructor(
    private firestore: Firestore,
    private toast: ToastrService,
    private authService: AuthService
  ) {}

  crearPerfilConUId(data: UsuarioModel, uid: string): Promise<void> {
    const dataRef = doc(this.firestore, this._collection, uid);
    const newData = {
      ...data,
      comuna: doc(this.firestore,  `Comunas/${data.comuna}`),
      iglesia: doc(this.firestore, `Iglesias/${data.iglesia}`)
    };
    return setDoc(dataRef, newData);
  }

  getPerfiles(): Observable<BaseModel<UsuarioModel>> {
    const _collection = collection(this.firestore, this._collection);
    return collectionData(_collection, { idField: 'id' }) as Observable<any>;
  }

  getPerfilesSelectOption() {
    const _collection = collection(this.firestore, this._collection);
    return collectionData(_collection, { idField: 'id' }).pipe(
      map((perfiles: any[]) =>
        perfiles.map((perfil) => ({
          value: perfil.id,
          label:
            perfil.documentNumber + ' ' + perfil.names + ' ' + perfil.lastNames,
        }))
      )
    ) as Observable<SelectOptionModel<any>[]>;
  }

  async getMiPerfil(id: string) {
    try {
      const userRef = doc(this.firestore, this._collection, id);
      const snapshot = await getDoc(userRef);
      const data = snapshot.data() as any | undefined | null;

      if (data) {
        if (data.iglesia) {
          const iglesiaSnapshot = await getDoc(data.iglesia);
          data.iglesia = iglesiaSnapshot.data() as any;
        }
        if (data.comuna) {
          const comunaSnapshot = await getDoc(data.comuna);
          data.comuna = comunaSnapshot.data() as any;
        }
      }

      return data;

    } catch (error) {
      return null;
    }
  }

  async deleteperfil(id: string) {
    const docRef = doc(this.firestore, `${this._collection}/${id}`);
    try {
      await deleteDoc(docRef);
      this.toast.success('perfil eliminado correctamente');
    } catch (error) {
      console.log(error);
      this.toast.success('Error al eliminar el perfil');
    }
  }

  async updateperfilId(id: string, data: any) {
    const docRef = doc(this.firestore, `${this._collection}/${id}`);
    await updateDoc(docRef, data);
  }
}
