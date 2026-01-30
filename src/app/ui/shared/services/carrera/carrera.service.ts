import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, doc, setDoc } from '@angular/fire/firestore';
import { CreateCarreraModel } from '../../../../models/carrera/carrera.model';

@Injectable({
    providedIn: 'root'
})
export class CarreraService {
    _collection: string = 'carreras';

    constructor(private readonly firestore: Firestore) { }

    createCarrera(carrera: CreateCarreraModel) {
        const collectionRef = collection(this.firestore, this._collection);
        return addDoc(collectionRef, carrera);
    }
}
