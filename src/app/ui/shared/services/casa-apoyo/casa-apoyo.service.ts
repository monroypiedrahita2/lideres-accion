import { inject, Injectable } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, deleteDoc, doc, updateDoc, query, where, arrayUnion, arrayRemove, getDoc, setDoc } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { BaseModel } from '../../../../models/base/base.model';
import { CasaApoyoModel } from '../../../../models/casa-apoyo/casa-apoyo.model';
import { environment } from '../../../../../environment';
import { AuthService } from '../auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class CasaApoyoService {
    private _collection: string = environment.collections.casasApoyo;
    private casaApoyoCache$: Observable<BaseModel<CasaApoyoModel>[]> | null = null;
    private currentUid: string | null = null;
    private authService = inject(AuthService);

    constructor(private readonly firestore: Firestore) { }

    createCasaApoyo(casa: BaseModel<CasaApoyoModel>) {
        console.log('[CasaApoyoService] createCasaApoyo →', { casa });
        const document = doc(this.firestore, this._collection, this.authService.uidUser());
        return setDoc(document, casa);
    }

    getCasasApoyo(): Observable<BaseModel<CasaApoyoModel>[]> {
        console.log('[CasaApoyoService] getCasasApoyo → (all)');
        const collectionRef = collection(this.firestore, this._collection);
        return collectionData(collectionRef, { idField: 'id' }) as Observable<BaseModel<CasaApoyoModel>[]>;
    }

    getCasaApoyo(id: string): Promise<any> {
        console.log('[CasaApoyoService] getCasaApoyo →', { id });
        const docRef = doc(this.firestore, this._collection, id);
        return getDoc(docRef).then((docSnap) => {
            if (docSnap.exists()) {
                return docSnap.data() as any;
            } else {
                return null;
            }
        });
    }

    deleteCasaApoyo(id: string): Promise<void> {
        console.log('[CasaApoyoService] deleteCasaApoyo →', { id });
        const docRef = doc(this.firestore, this._collection, id);
        return deleteDoc(docRef);
    }

    async assignResponsable(oldCasaId: string, responsableId?: string, responsableNombre?: string, responsableCedula?: string): Promise<void> {
        console.log('[CasaApoyoService] assignResponsable →', { oldCasaId, responsableId, responsableNombre });
        const oldDocRef = doc(this.firestore, this._collection, oldCasaId);
        const oldDocSnap = await getDoc(oldDocRef);

        if (!oldDocSnap.exists()) {
            throw new Error('Casa de apoyo no encontrada');
        }

        const data = oldDocSnap.data() as BaseModel<CasaApoyoModel>;
        const casaData = data.data;

        let newCasaId: string;
        if (responsableId) {
            newCasaId = responsableId;
            casaData.responsableNombre = responsableNombre || '';
            casaData.responsableApellido = '';
            casaData.responsableNombre = responsableNombre || '';
        } else {
            const newDocRef = doc(collection(this.firestore, this._collection));
            newCasaId = newDocRef.id;
            casaData.responsableNombre = '';
            casaData.responsableApellido = '';
            casaData.responsableTelefono = '';
            casaData.aprobado = false;
            casaData.aprobadoPor = null;
        }

        // @ts-ignore
        casaData.updatedAt = new Date();

        const newDocRef = doc(this.firestore, this._collection, newCasaId);
        const newData: BaseModel<CasaApoyoModel> = {
            ...data,
            id: newCasaId,
            data: casaData
        };

        await setDoc(newDocRef, newData);

        const vehiclesRef = collection(this.firestore, environment.collections.vehiculos);
        const q = query(vehiclesRef, where('data.casaApoyoId', '==', oldCasaId));
        const querySnapshot = await import('@angular/fire/firestore').then(m => m.getDocs(q));

        const updatePromises = querySnapshot.docs.map(docSnap => {
            const vDocRef = doc(this.firestore, environment.collections.vehiculos, docSnap.id);
            return updateDoc(vDocRef, {
                'data.casaApoyoId': newCasaId
            });
        });
        await Promise.all(updatePromises);

        await deleteDoc(oldDocRef);
    }

    getCasaApoyoByDireccion(direccion: string) {
        console.log('[CasaApoyoService] getCasaApoyoByDireccion →', { direccion });
        const q = query(collection(this.firestore, this._collection), where('data.direccion', '==', direccion));
        return collectionData(q, { idField: 'id' }) as Observable<BaseModel<CasaApoyoModel>[]>;
    }

    getCasasApoyoByIglesia(iglesiaId: string) {
        console.log('[CasaApoyoService] getCasasApoyoByIglesia →', { iglesiaId });
        const q = query(collection(this.firestore, this._collection), where('data.iglesia.id', '==', iglesiaId));
        return collectionData(q, { idField: 'id' }) as Observable<BaseModel<CasaApoyoModel>[]>;
    }

    getCasasApoyoAprobadasByIglesia(iglesiaId: string) {
        console.log('[CasaApoyoService] getCasasApoyoAprobadasByIglesia →', { iglesiaId });
        const q = query(
            collection(this.firestore, this._collection),
            where('data.iglesia.id', '==', iglesiaId),
            where('data.aprobado', '==', true)
        );
        return collectionData(q, { idField: 'id' }) as Observable<BaseModel<CasaApoyoModel>[]>;
    }

    getCasasApoyoByResponsable(uid: string): Observable<BaseModel<CasaApoyoModel>[]> {
        console.log('[CasaApoyoService] getCasasApoyoByResponsable →', { uid });
        const docRef = doc(this.firestore, this._collection, uid);
        return new Observable<BaseModel<CasaApoyoModel>[]>(observer => {
            const unsubscribe = import('@angular/fire/firestore').then(m => {
                return m.onSnapshot(docRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data() as BaseModel<CasaApoyoModel>;
                        data.id = docSnap.id;
                        observer.next([data]);
                    } else {
                        observer.next([]);
                    }
                }, (error) => {
                    observer.error(error);
                });
            });

            return () => {
                unsubscribe.then(unsub => unsub());
            };
        });
    }

    addVehiculoToCasa(casaId: string, vehiculo: any): Promise<void> {
        console.log('[CasaApoyoService] addVehiculoToCasa →', { casaId, vehiculo });
        const docRef = doc(this.firestore, this._collection, casaId);
        return updateDoc(docRef, {
            'data.vehiculos': arrayUnion(vehiculo),
            'data.updatedAt': new Date()
        });
    }

    removeVehiculoFromCasa(casaId: string, vehiculo: any): Promise<void> {
        console.log('[CasaApoyoService] removeVehiculoFromCasa →', { casaId, vehiculo });
        const docRef = doc(this.firestore, this._collection, casaId);
        return updateDoc(docRef, {
            'data.vehiculos': arrayRemove(vehiculo),
            'data.updatedAt': new Date()
        });
    }

    updateCasaApoyo(id: string, data: CasaApoyoModel): Promise<void> {
        console.log('[CasaApoyoService] updateCasaApoyo →', { id, data });
        const docRef = doc(this.firestore, this._collection, id);
        return updateDoc(docRef, {
            data: data
        });
    }
}
