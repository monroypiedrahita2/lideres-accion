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
        const document = doc(this.firestore, this._collection, this.authService.uidUser());
        return setDoc(document, casa);
    }


    getCasasApoyo(): Observable<BaseModel<CasaApoyoModel>[]> {
        const collectionRef = collection(this.firestore, this._collection);
        return collectionData(collectionRef, { idField: 'id' }) as Observable<BaseModel<CasaApoyoModel>[]>;
    }

    getCasaApoyo(id: string): Promise<any> {
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
        const docRef = doc(this.firestore, this._collection, id);
        return deleteDoc(docRef);
    }

    async assignResponsable(oldCasaId: string, responsableId?: string, responsableNombre?: string, responsableCedula?: string): Promise<void> {
        // 1. Get the current document
        const oldDocRef = doc(this.firestore, this._collection, oldCasaId);
        const oldDocSnap = await getDoc(oldDocRef);

        if (!oldDocSnap.exists()) {
            throw new Error('Casa de apoyo no encontrada');
        }

        const data = oldDocSnap.data() as BaseModel<CasaApoyoModel>;
        const casaData = data.data;

        // 2. Determine the new ID
        // If assigning (responsableId provided), use it as the new ID.
        // If unassigning, generate a new random ID.
        let newCasaId: string;
        if (responsableId) {
            newCasaId = responsableId;
            // Update responsible info
            casaData.responsableNombre = responsableNombre || '';
            casaData.responsableApellido = ''; // We might not have this if not passed, but interface has it.
            // Actually the previous code updated responsableNombre and Cedula.
            // The model shows responsableNombre, responsableApellido, responsableTelefono.
            // The previous assignResponsable signature had nombre and cedula.
            // We should try to keep consistent data.
            // Let's assume the passed name is full name or we just update what we have.
            // The previous update was:
            // 'data.responsableId': responsableId,
            // 'data.responsableNombre': responsableNombre,
            // 'data.responsableCedula': responsableCedula,

            // Adjusting to CasaApoyoModel interface:
            // responsableNombre, responsableApellido, responsableTelefono.
            // We might need to parse name or just put it in nombre?
            // The calling component passes `${this.usuario.nombre} ${this.usuario.apellido}` as name.
            // Let's store it in responsableNombre for now or try to split if we want to be precise, 
            // but the Model has separate fields.
            // For now, I will map 'responsableNombre' arg to 'responsableNombre' field.
            casaData.responsableNombre = responsableNombre || '';
            // responsableCedula is NOT in the interface shown in Step 13, but was in the update?
            // "responsableCedula" was in the old updateDoc call.
            // "responsableTelefono" IS in the interface.
        } else {
            // Unassigning - create a new auto-generated ID
            const newDocRef = doc(collection(this.firestore, this._collection));
            newCasaId = newDocRef.id;

            // Clear responsible info
            casaData.responsableNombre = '';
            casaData.responsableApellido = '';
            casaData.responsableTelefono = '';
            // And clean up other fields if needed, like aprobado?
            // If unassigned, it probably shouldn't be approved?
            casaData.aprobado = false;
            casaData.aprobadoPor = null;
        }

        // Update timestamp
        // @ts-ignore
        casaData.updatedAt = new Date();

        // 3. Create the new document
        const newDocRef = doc(this.firestore, this._collection, newCasaId);
        const newData: BaseModel<CasaApoyoModel> = {
            ...data,
            id: newCasaId, // Ensure ID in base model matches
            data: casaData
        };

        await setDoc(newDocRef, newData);

        // 4. Update linked vehicles
        // We need to find all vehicles that have casaApoyoId == oldCasaId and update them to newCasaId
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

        // 5. Delete the old document
        await deleteDoc(oldDocRef);
    }

    getCasaApoyoByDireccion(direccion: string) {
        const q = query(collection(this.firestore, this._collection), where('data.direccion', '==', direccion));
        return collectionData(q, { idField: 'id' }) as Observable<BaseModel<CasaApoyoModel>[]>;
    }

    getCasasApoyoByIglesia(iglesiaId: string) {
        // Keeping this for backward compatibility if needed, though getCasasApoyoAprobadasByIglesia is preferred for the list
        const q = query(collection(this.firestore, this._collection), where('data.iglesia.id', '==', iglesiaId));
        return collectionData(q, { idField: 'id' }) as Observable<BaseModel<CasaApoyoModel>[]>;
    }

    getCasasApoyoAprobadasByIglesia(iglesiaId: string) {
        const q = query(
            collection(this.firestore, this._collection),
            where('data.iglesia.id', '==', iglesiaId),
            where('data.aprobado', '==', true)
        );
        return collectionData(q, { idField: 'id' }) as Observable<BaseModel<CasaApoyoModel>[]>;
    }

    // Better method name for clarity if we are passing user ID
    // Fetches the single house document where ID matches the user's UID
    getCasasApoyoByResponsable(uid: string): Observable<BaseModel<CasaApoyoModel>[]> {
        const docRef = doc(this.firestore, this._collection, uid);
        return new Observable<BaseModel<CasaApoyoModel>[]>(observer => {
            // We use onSnapshot to get real-time updates for this single document
            // taking advantage of the fact that we return an array for compatibility
            const unsubscribe = import('@angular/fire/firestore').then(m => {
                return m.onSnapshot(docRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data() as BaseModel<CasaApoyoModel>;
                        // Ensure ID is attached
                        data.id = docSnap.id;
                        observer.next([data]);
                    } else {
                        observer.next([]);
                    }
                }, (error) => {
                    observer.error(error);
                });
            });

            // Return teardown logic
            return () => {
                unsubscribe.then(unsub => unsub());
            };
        });
    }


    addVehiculoToCasa(casaId: string, vehiculo: any): Promise<void> {
        const docRef = doc(this.firestore, this._collection, casaId);
        return updateDoc(docRef, {
            'data.vehiculos': arrayUnion(vehiculo),
            'data.updatedAt': new Date()
        });
    }

    removeVehiculoFromCasa(casaId: string, vehiculo: any): Promise<void> {
        const docRef = doc(this.firestore, this._collection, casaId);
        return updateDoc(docRef, {
            'data.vehiculos': arrayRemove(vehiculo),
            'data.updatedAt': new Date()
        });
    }

    updateCasaApoyo(id: string, data: CasaApoyoModel): Promise<void> {
        const docRef = doc(this.firestore, this._collection, id);
        return updateDoc(docRef, {
            data: data
        });
    }
}
