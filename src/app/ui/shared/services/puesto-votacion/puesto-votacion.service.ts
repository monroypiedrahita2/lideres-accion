import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection } from '@angular/fire/firestore';
import { PuestoVotacionModel } from '../../../../models/puesto-votacion/puesto-votacion.model';
import { BaseModel } from '../../../../models/base/base.model';

@Injectable({
    providedIn: 'root'
})
export class PuestoVotacionService {

    constructor(private firestore: Firestore) { }

    createPuestoVotacion(puesto: BaseModel<PuestoVotacionModel>) {
        const puestoRef = collection(this.firestore, 'puestos-votacion');
        return addDoc(puestoRef, puesto);
    }
}
