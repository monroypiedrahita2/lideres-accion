import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, query, where, orderBy, limit, getDocs, startAfter, endBefore, getCountFromServer, deleteDoc, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { BaseModel } from '../../../../models/base/base.model';
import { environment } from '../../../../../environment';
import { ComunaModel } from '../../../../models/comuna/comuna.model';

@Injectable({
  providedIn: 'root'
})
export class ComunaService {
  _collection: string = environment.collections.comunas;
  lastDoc: any = null; // Para paginación

  constructor(private readonly firestore: Firestore) { }



  createComuna(comuna: BaseModel<ComunaModel>) {
    console.log('[ComunaService] createComuna →', { comuna });
    const collectionRef = collection(this.firestore, this._collection);
    return addDoc(collectionRef, comuna);
  }

  getComunas() {
    console.log('[ComunaService] getComunas → (all)');
    const collectionRef = collection(this.firestore, this._collection);
    return collectionData(collectionRef, { idField: 'id' }) as Observable<BaseModel<ComunaModel>[]>;
  }

  getComunaByMunicipio(value: string) {
    console.log('[ComunaService] getComunaByMunicipio →', { municipio: value });
    const q = query(collection(this.firestore, this._collection), where('data.municipio', '==', value));
    const response = collectionData(q, { idField: 'id' }) as Observable<BaseModel<ComunaModel>[]>;
    return response;
  }

  async getFirstPage(municipio: string) {
    console.log('[ComunaService] getFirstPage →', { municipio });
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
    console.log('[ComunaService] countByMunicipio →', { municipio });
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
    console.log('[ComunaService] deleteComuna →', { id });
    const docRef = doc(this.firestore, `${this._collection}/${id}`);
    await deleteDoc(docRef);
  }

  getComuna(id: string): Promise<any> {
    console.log('[ComunaService] getComuna →', { id });
    const docRef = doc(this.firestore, this._collection, id);
    return getDoc(docRef).then((docSnap) => {
      if (docSnap.exists()) {
        return docSnap.data() as any;
      } else {
        throw new Error('No existe o permisos insuficientes');
      }
    });
  }

  updateComuna(id: string, newData: BaseModel<ComunaModel>) {
    console.log('[ComunaService] updateComuna →', { id, newData });
    const document = doc(this.firestore, this._collection, id);
    return updateDoc(document, { ...newData });
  }

  async getFirstPageBySearch(iglesiaId: string, searchText: string) {
    const pageSize = 3;
    const colRef = collection(this.firestore, this._collection);
    const q = query(
      colRef,
      where('data.iglesiaId', '==', iglesiaId),
      where('data.comuna', '>=', searchText),
      where('data.comuna', '<=', searchText + '\uf8ff'),
      orderBy('data.comuna'),
      limit(pageSize + 1)
    );
    const snapshot = await getDocs(q);

    const docs = snapshot.docs;
    const hasMore = docs.length > pageSize;
    const returned = docs.slice(0, pageSize);

    this.lastDoc = returned.at(-1) || null;

    return { items: returned.map((doc) => ({ id: doc.id, ...(doc.data() as any) })), hasMore };
  }

  async getNextPageBySearch(iglesiaId: string, searchText: string) {
    const pageSize = 3;
    if (!this.lastDoc) return { items: [], hasMore: false };

    const colRef = collection(this.firestore, this._collection);
    const q = query(
      colRef,
      where('data.iglesiaId', '==', iglesiaId),
      where('data.comuna', '>=', searchText),
      where('data.comuna', '<=', searchText + '\uf8ff'),
      orderBy('data.comuna'),
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

  async getPreviousPageBySearch(iglesiaId: string, searchText: string) {
    const pageSize = 3;
    if (!this.lastDoc) return { items: [], hasMore: false };

    const colRef = collection(this.firestore, this._collection);
    const q = query(
      colRef,
      where('data.iglesiaId', '==', iglesiaId),
      where('data.comuna', '>=', searchText),
      where('data.comuna', '<=', searchText + '\uf8ff'),
      orderBy('data.comuna'),
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

  async searchComunas(searchText: string) {
    const pageSize = 20;
    // Normalize search text to capital case if that matches the DB, usually it's better to rely on what user types or standard.
    // Assuming data.barrio is stored as is.
    // The user requirement said: "independiente de la iglesia".
    const colRef = collection(this.firestore, this._collection);
    const q = query(
      colRef,
      where('data.barrio', '>=', searchText),
      where('data.barrio', '<=', searchText + '\uf8ff'),
      limit(pageSize)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));
  }
}
