import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, query, where, orderBy, limit, getDocs, startAfter, endBefore, getCountFromServer, deleteDoc, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { PuestoVotacionModel } from '../../../../models/puesto-votacion/puesto-votacion.model';
import { BaseModel } from '../../../../models/base/base.model';
import { environment } from '../../../../../environment';

@Injectable({
    providedIn: 'root'
})
export class PuestoVotacionService {
    _collection: string = environment.collections.puestosVotacion;
    lastDoc: any = null; // Para paginación

    constructor(private readonly firestore: Firestore) { }

    createPuestoVotacion(puesto: BaseModel<PuestoVotacionModel>) {
        const puestoRef = collection(this.firestore, this._collection);
        return addDoc(puestoRef, puesto);
    }

    getPuestosVotacion() {
        const collectionRef = collection(this.firestore, this._collection);
        return collectionData(collectionRef, { idField: 'id' }) as Observable<BaseModel<PuestoVotacionModel>[]>;
    }

    getPuestosByIglesia(iglesiaId: string) {
        const q = query(
            collection(this.firestore, this._collection),
            where('data.iglesia', '==', iglesiaId),
            orderBy('data.nombre')
        );
        return collectionData(q, { idField: 'id' }) as Observable<BaseModel<PuestoVotacionModel>[]>;
    }
    getPuestosByMunicipio(municipio: string) {
        const q = query(
            collection(this.firestore, this._collection),
            where('data.municipio', '==', municipio),
            orderBy('data.nombre')
        );
        return collectionData(q, { idField: 'id' }) as Observable<BaseModel<PuestoVotacionModel>[]>;
    }

    getPuestoVotacionByMunicipio(value: string) {
        const q = query(collection(this.firestore, this._collection), where('data.municipio', '==', value));
        const response = collectionData(q, { idField: 'id' }) as Observable<BaseModel<PuestoVotacionModel>[]>;
        return response;
    }

    async getFirstPageByMunicipio(municipio: string, pageSize: number = 5) {
        const colRef = collection(this.firestore, this._collection);
        const q = query(
            colRef,
            where('data.municipio', '==', municipio),
            orderBy('data.nombre'),
            limit(pageSize + 1)
        );
        const snapshot = await getDocs(q);

        const docs = snapshot.docs;
        const hasMore = docs.length > pageSize;
        const returned = docs.slice(0, pageSize);

        this.lastDoc = returned.at(-1) || null;

        return { items: returned.map((doc) => ({ id: doc.id, ...(doc.data() as any) })), hasMore };
    }

    async getNextPageByMunicipio(municipio: string, pageSize: number = 5) {
        if (!this.lastDoc) return { items: [], hasMore: false };

        const colRef = collection(this.firestore, this._collection);
        const q = query(
            colRef,
            where('data.municipio', '==', municipio),
            orderBy('data.nombre'),
            startAfter(this.lastDoc),
            limit(pageSize + 1)
        );
        const snapshot = await getDocs(q);

        const docs = snapshot.docs;
        const hasMore = docs.length > pageSize;
        const returned = docs.slice(0, pageSize);

        this.lastDoc = returned.at(-1) || null;

        return { items: returned.map((doc) => ({ id: doc.id, ...(doc.data() as any) })), hasMore };
    }

    async getPreviousPageByMunicipio(municipio: string, pageSize: number = 5) {
        if (!this.lastDoc) return { items: [], hasMore: false };

        const colRef = collection(this.firestore, this._collection);
        const q = query(
            colRef,
            where('data.municipio', '==', municipio),
            orderBy('data.nombre'),
            endBefore(this.lastDoc),
            limit(pageSize + 1)
        );
        const snapshot = await getDocs(q);

        const docs = snapshot.docs;
        const hasMore = docs.length > pageSize;
        const returned = docs.slice(Math.max(0, docs.length - pageSize));

        this.lastDoc = returned.at(-1) || null;

        return { items: returned.map((doc) => ({ id: doc.id, ...(doc.data() as any) })), hasMore };
    }

    async getFirstPageByIglesia(iglesiaId: string, pageSize: number = 5) {
        const colRef = collection(this.firestore, this._collection);
        const q = query(
            colRef,
            orderBy('data.nombre'),
            where('data.iglesia', '==', iglesiaId),
            limit(pageSize + 1)
        );
        const snapshot = await getDocs(q);

        const docs = snapshot.docs;
        const hasMore = docs.length > pageSize;
        const returned = docs.slice(0, pageSize);

        this.lastDoc = returned.at(-1) || null;

        return { items: returned.map((doc) => ({ id: doc.id, ...(doc.data() as any) })), hasMore };
    }

    async getNextPageByIglesia(iglesiaId: string, pageSize: number = 5) {
        if (!this.lastDoc) return { items: [], hasMore: false };

        const colRef = collection(this.firestore, this._collection);
        const q = query(
            colRef,
            orderBy('data.nombre'),
            where('data.iglesia', '==', iglesiaId),
            startAfter(this.lastDoc),
            limit(pageSize + 1)
        );
        const snapshot = await getDocs(q);

        const docs = snapshot.docs;
        const hasMore = docs.length > pageSize;
        const returned = docs.slice(0, pageSize);

        this.lastDoc = returned.at(-1) || null;

        return { items: returned.map((doc) => ({ id: doc.id, ...(doc.data() as any) })), hasMore };
    }

    async getPreviousPageByIglesia(iglesiaId: string, pageSize: number = 5) {
        if (!this.lastDoc) return { items: [], hasMore: false };

        const colRef = collection(this.firestore, this._collection);
        const q = query(
            colRef,
            orderBy('data.nombre'),
            where('data.iglesia', '==', iglesiaId),
            endBefore(this.lastDoc),
            limit(pageSize + 1)
        );
        const snapshot = await getDocs(q);

        const docs = snapshot.docs;
        const hasMore = docs.length > pageSize;
        const returned = docs.slice(Math.max(0, docs.length - pageSize));

        this.lastDoc = returned.at(-1) || null;

        return { items: returned.map((doc) => ({ id: doc.id, ...(doc.data() as any) })), hasMore };
    }

    async countByMunicipio(municipio: string) {
        const colRef = collection(this.firestore, this._collection);
        const q = query(colRef, where('data.municipio', '==', municipio));
        const snapshot = await getCountFromServer(q);
        return snapshot.data().count;
    }

    async countByIglesia(iglesiaId: string) {
        const colRef = collection(this.firestore, this._collection);
        const q = query(colRef, where('data.iglesia', '==', iglesiaId));
        const snapshot = await getCountFromServer(q);
        return snapshot.data().count;
    }

    async deletePuestoVotacion(id: string) {
        const docRef = doc(this.firestore, `${this._collection}/${id}`);
        await deleteDoc(docRef);
    }

    getPuestoVotacion(id: string): Promise<any> {
        const docRef = doc(this.firestore, this._collection, id);
        return getDoc(docRef).then((docSnap) => {
            if (docSnap.exists()) {
                return docSnap.data() as any;
            } else {
                throw new Error('No existe o permisos insuficientes');
            }
        });
    }

    updatePuestoVotacion(id: string, newData: BaseModel<PuestoVotacionModel>) {
        const document = doc(this.firestore, this._collection, id);
        return updateDoc(document, { ...newData });
    }
}
