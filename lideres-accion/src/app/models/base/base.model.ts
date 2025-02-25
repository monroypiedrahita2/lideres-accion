import { DocumentReference } from "@angular/fire/firestore";

export interface BaseModel <T> {
    id?: string;
    data: T;
    fechaCreacion: string;
    fechaModificacion?: string;
    creadoPor: string;
    modificadoPor?: DocumentReference;
}

export interface DataUserModel {
    uid: string;
    email: string;
}
