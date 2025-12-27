import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, query, where, orderBy, limit, getDocs, startAfter, endBefore, getCountFromServer, deleteDoc, doc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { BaseModel } from '../../../../models/base/base.model';
import { environment } from '../../../../../enviroments';
import { ComunaModel } from '../../../../models/comuna/comuna.model';

@Injectable({
  providedIn: 'root'
})
export class ComunaService {
  _collection: string = environment.collections.comunas;
  lastDoc: any = null; // Para paginación

  constructor(private readonly firestore: Firestore) { }



  createComuna(comuna: BaseModel<ComunaModel>) {
    const collectionRef = collection(this.firestore, this._collection);
    return addDoc(collectionRef, comuna);
  }

  getComunas() {
    const collectionRef = collection(this.firestore, this._collection);
    return collectionData(collectionRef, { idField: 'id' }) as Observable<BaseModel<ComunaModel>[]>;
  }

  getComunaByMunicipio(value: string) {
    const q = query(collection(this.firestore, this._collection), where('data.municipio', '==', value));
    const response = collectionData(q, { idField: 'id' }) as Observable<BaseModel<ComunaModel>[]>;
    return response;
  }

  async getFirstPage(municipio: string) {
    const pageSize = 5;
    const colRef = collection(this.firestore, this._collection);
    const q = query(
      colRef,
      orderBy('data.comuna'),
      where('data.municipio', '==', municipio),
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

  async getNextPage(municipio: string) {
    const pageSize = 5;
    if (!this.lastDoc) return { items: [], hasMore: false };

    const colRef = collection(this.firestore, this._collection);
    const q = query(
      colRef,
      orderBy('data.comuna'),
      where('data.municipio', '==', municipio),
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

  async getPreviousPage(municipio: string) {
    const pageSize = 5;
    if (!this.lastDoc) return { items: [], hasMore: false };

    const colRef = collection(this.firestore, this._collection);
    const q = query(
      colRef,
      orderBy('data.comuna'),
      where('data.municipio', '==', municipio),
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

  async countByMunicipio(municipio: string) {
    const colRef = collection(this.firestore, this._collection);
    const q = query(colRef, where('data.municipio', '==', municipio));
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  }

  async getFirstPageByIglesia(iglesiaId: string) {
    const pageSize = 5;
    const colRef = collection(this.firestore, this._collection);
    const q = query(
      colRef,
      orderBy('data.comuna'),
      where('data.iglesiaId', '==', iglesiaId),
      limit(pageSize + 1)
    );
    const snapshot = await getDocs(q);

    const docs = snapshot.docs;
    const hasMore = docs.length > pageSize;
    const returned = docs.slice(0, pageSize);

    this.lastDoc = returned.at(-1) || null;

    return { items: returned.map((doc) => ({ id: doc.id, ...(doc.data() as any) })), hasMore };
  }

  async getNextPageByIglesia(iglesiaId: string) {
    const pageSize = 5;
    if (!this.lastDoc) return { items: [], hasMore: false };

    const colRef = collection(this.firestore, this._collection);
    const q = query(
      colRef,
      orderBy('data.comuna'),
      where('data.iglesiaId', '==', iglesiaId),
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

  async getPreviousPageByIglesia(iglesiaId: string) {
    const pageSize = 5;
    if (!this.lastDoc) return { items: [], hasMore: false };

    const colRef = collection(this.firestore, this._collection);
    const q = query(
      colRef,
      orderBy('data.comuna'),
      where('data.iglesiaId', '==', iglesiaId),
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

  async getPageByIglesia(iglesiaId: string, startAfterDoc?: any) {
    const pageSize = 3;
    const colRef = collection(this.firestore, this._collection);
    const constraints: any[] = [orderBy('data.comuna'), where('data.iglesiaId', '==', iglesiaId)];
    if (startAfterDoc) constraints.push(startAfter(startAfterDoc));
    constraints.push(limit(pageSize + 1));
    const q = query(colRef, ...constraints);
    const snapshot = await getDocs(q);

    const docs = snapshot.docs;
    const hasMore = docs.length > pageSize;
    const returned = docs.slice(0, pageSize);

    return {
      items: returned.map((doc) => ({ id: doc.id, ...(doc.data() as any) })),
      hasMore,
      firstDoc: returned[0] || null,
      lastDoc: returned.at(-1) || null,
    };
  }

  async deleteComuna(id: string) {
    const docRef = doc(this.firestore, `${this._collection}/${id}`);
    await deleteDoc(docRef);
  }
}
