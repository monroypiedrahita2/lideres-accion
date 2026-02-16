import { BaseModel } from '../../../../models/base/base.model';
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
    orderBy,
    limit,
    getDocs,
    startAfter,
    getCountFromServer,
    endBefore,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environment';
import { TestigoModel } from '../../../../models/testigo/testigo.model';

@Injectable({ providedIn: 'root' })
export class TestigoService {
    _collection: string = environment.collections.coordinadorTestigos;
    lastDoc: any = null; // Para paginación

    constructor(private readonly firestore: Firestore) { }

    crearTestigo(
        data: BaseModel<TestigoModel>,
        id: string
    ): Promise<void> {
        const dataRef = doc(this.firestore, this._collection, id);
        return setDoc(dataRef, data);
    }

    async existeTestigo(documento: string): Promise<boolean> {
        const docRef = doc(this.firestore, this._collection, documento);
        return getDoc(docRef).then((docSnap) => {
            if (docSnap.exists()) {
                return true;
            } else {
                return false;
            }
        });
    }

    getAllTestigos(): Observable<BaseModel<TestigoModel>[]> {
        const _collection = collection(this.firestore, this._collection);
        return collectionData(_collection, { idField: 'id' }) as Observable<BaseModel<TestigoModel>[]>;
    }

    getTestigoBySearch(criterio: string, value: string | boolean) {
        const q = query(
            collection(this.firestore, this._collection),
            where(criterio, '==', value)
        );
        const response = collectionData(q, { idField: 'id' }) as Observable<any[]>;
        return response;
    }

    getTestigoByDocument(value: string) {
        const docRef = doc(this.firestore, this._collection, value);
        return getDoc(docRef).then((docSnap) => {
            if (docSnap.exists()) {
                return docSnap.data() as any;
            } else {
                throw new Error('No existe o es nuevo');
            }
        });
    }

    getTestigosByIglesia(
        iglesia: string
    ): Observable<BaseModel<TestigoModel>[]> {
        const q = query(
            collection(this.firestore, this._collection),
            where('data.iglesiaId', '==', iglesia)
        );
        return collectionData(q, { idField: 'id' }) as Observable<any[]>;
    }

    getTestigo(id: string): Promise<any> {
        const docRef = doc(this.firestore, this._collection, id);
        return getDoc(docRef).then((docSnap) => {
            if (docSnap.exists()) {
                return docSnap.data() as any;
            } else {
                throw new Error('No existe o permisos insuficientes');
            }
        });
    }

    async deleteTestigo(id: string) {
        const docRef = doc(this.firestore, `${this._collection}/${id}`);
        await deleteDoc(docRef);
    }

    updateTestigo(id: string, newData: BaseModel<TestigoModel>) {
        const document = doc(this.firestore, this._collection, id);
        return updateDoc(document, { ...newData });
    }

    async getFirstPage(iglesia: string) {
        const pageSize = 5;
        const colRef = collection(this.firestore, this._collection);
        const q = query(
            colRef,
            orderBy('data.nombre'),
            where('data.iglesiaId', '==', iglesia),
            limit(pageSize + 1)
        );
        const snapshot = await getDocs(q);

        const docs = snapshot.docs;
        const hasMore = docs.length > pageSize;
        const returned = docs.slice(0, pageSize);

        // Guardamos el último doc (el que se mostró) para la siguiente página
        this.lastDoc = returned.at(-1) || null;

        return { items: returned.map((doc) => ({ id: doc.id, ...(doc.data() as any) })), hasMore };
    }

    async getNextPage(iglesia: string) {
        const pageSize = 5;
        if (!this.lastDoc) return { items: [], hasMore: false };

        const colRef = collection(this.firestore, this._collection);
        const q = query(
            colRef,
            orderBy('data.nombre'),
            where('data.iglesiaId', '==', iglesia),
            startAfter(this.lastDoc), // empieza después del último
            limit(pageSize + 1)
        );
        const snapshot = await getDocs(q);

        const docs = snapshot.docs;
        const hasMore = docs.length > pageSize;
        const returned = docs.slice(0, pageSize);

        this.lastDoc = returned.at(-1) || null;

        return { items: returned.map((doc) => ({ id: doc.id, ...(doc.data() as any) })), hasMore };
    }

    async getPreviousPage(iglesia: string) {
        const pageSize = 5;
        if (!this.lastDoc) return { items: [], hasMore: false };

        const colRef = collection(this.firestore, this._collection);
        const q = query(
            colRef,
            orderBy('data.nombre'),
            where('data.iglesiaId', '==', iglesia),
            endBefore(this.lastDoc), // empieza antes del último
            limit(pageSize + 1)
        );
        const snapshot = await getDocs(q);

        const docs = snapshot.docs;
        const hasMore = docs.length > pageSize;
        const returned = docs.slice(Math.max(0, docs.length - pageSize));

        this.lastDoc = returned.at(-1) || null;

        return { items: returned.map((doc) => ({ id: doc.id, ...(doc.data() as any) })), hasMore };
    }

    async getFirstPageByName(nombre: string, iglesia: string) {
        const pageSize = 5;
        const colRef = collection(this.firestore, this._collection);
        const q = query(
            colRef,
            where('data.nombre', '>=', nombre),
            where('data.nombre', '<=', nombre + '\uf8ff'),
            where('data.iglesiaId', '==', iglesia),
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

    async getNextPageByName(nombre: string, iglesia: string) {
        const pageSize = 5;
        if (!this.lastDoc) return { items: [], hasMore: false };
        const colRef = collection(this.firestore, this._collection);
        const q = query(
            colRef,
            where('data.nombre', '>=', nombre),
            where('data.nombre', '<=', nombre + '\uf8ff'),
            where('data.iglesiaId', '==', iglesia),
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

    async getPreviousPageByName(nombre: string, iglesia: string) {
        const pageSize = 5;
        if (!this.lastDoc) return { items: [], hasMore: false };
        const colRef = collection(this.firestore, this._collection);
        const q = query(
            colRef,
            where('data.nombre', '>=', nombre),
            where('data.nombre', '<=', nombre + '\uf8ff'),
            where('data.iglesiaId', '==', iglesia),
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

    async countByIglesia(iglesia: string) {
        const colRef = collection(this.firestore, this._collection);
        const q = query(colRef, where('data.iglesiaId', '==', iglesia));
        const snapshot = await getCountFromServer(q);
        return snapshot.data().count;
    }
}
