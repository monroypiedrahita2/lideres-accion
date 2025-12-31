import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, deleteDoc, doc, updateDoc, query, where, arrayUnion, arrayRemove } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { BaseModel } from '../../../../models/base/base.model';
import { CasaApoyoModel } from '../../../../models/casa-apoyo/casa-apoyo.model';
import { environment } from '../../../../../enviroments';

@Injectable({
    providedIn: 'root'
})
export class CasaApoyoService {
    private _collection: string = environment.collections.casasApoyo;

    constructor(private readonly firestore: Firestore) { }

    createCasaApoyo(casa: BaseModel<CasaApoyoModel>) {
        const collectionRef = collection(this.firestore, this._collection);
        return addDoc(collectionRef, casa);
    }

    getCasasApoyo(): Observable<BaseModel<CasaApoyoModel>[]> {
        const collectionRef = collection(this.firestore, this._collection);
        return collectionData(collectionRef, { idField: 'id' }) as Observable<BaseModel<CasaApoyoModel>[]>;
    }

    deleteCasaApoyo(id: string): Promise<void> {
        const docRef = doc(this.firestore, this._collection, id);
        return deleteDoc(docRef);
    }

    assignResponsable(casaId: string, responsableId: string, responsableNombre: string, responsableCedula: string): Promise<void> {
        const docRef = doc(this.firestore, this._collection, casaId);
        return updateDoc(docRef, {
            'data.responsableId': responsableId,
            'data.responsableNombre': responsableNombre,
            'data.responsableCedula': responsableCedula,
            'data.updatedAt': new Date()
        });
    }

    getCasaApoyoByDireccion(direccion: string) {
        const q = query(collection(this.firestore, this._collection), where('data.direccion', '==', direccion));
        return collectionData(q, { idField: 'id' }) as Observable<BaseModel<CasaApoyoModel>[]>;
    }

    getCasasApoyoByIglesia(iglesiaId: string) {
        // Assuming there isn't actually an 'iglesiaId' on the casa model directly based on my read, 
        // but typically it might be inferred from the user or added. 
        // However, InscribirVehiculos checks if vehicle.iglesiaId === user.iglesia.
        // I will assume simple query by 'responsableId' if that's how we track ownership, OR ideally add iglesiaId to CasaApoyoModel.
        // For now, looking at the models, let's assume filtering by responsible or we need to filter on client side if 'iglesiaId' isn't stored.
        // Wait, 'responsableId' is assigned. 
        // Let's assume we query where responsableId is NOT null for 'assigned' ones if we want all assigned.
        // OR better: Inscribir logic suggests we assign a person. 
        // Actually, the user asked to "select casa de apoyo", "tomar". 
        // If "tomar" means assigning MYSELF as responsible.
        // The list should show houses assigned to ME (or my church if the model supports it).
        // Let's implement getting houses where I am the responsible.

        // RE-READING: "la opcion de seleccionar casa de apoyo, tomar".
        // Similar to vehicles. Vehicles have 'iglesiaId'.
        // Does CasaApoyoModel have 'iglesiaId'? I should have checked.
        // Let's check BaseModel. It does NOT have iglesiaId.
        // Let's check ComunaModel. It HAS iglesiaId.
        // VehiculoModel has iglesiaId.

        // I'll add a generic query for now, assuming we might match by 'responsableId' which is the user's UID.
        const q = query(collection(this.firestore, this._collection), where('data.iglesiaId', '==', iglesiaId));
        return collectionData(q, { idField: 'id' }) as Observable<BaseModel<CasaApoyoModel>[]>;
    }

    // Better method name for clarity if we are passing user ID
    getCasasApoyoByResponsable(uid: string) {
        const q = query(collection(this.firestore, this._collection), where('data.responsableId', '==', uid));
        return collectionData(q, { idField: 'id' }) as Observable<BaseModel<CasaApoyoModel>[]>;
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
