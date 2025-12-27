
export interface BaseModel <T> {
    id?: string;
    data: T;
    fechaCreacion: string;
    fechaModificacion?: string;
    creadoPor: string;
    modificadoPor?: string;
}

export interface DataUserModel {
    uid: string;
    email: string;
}


