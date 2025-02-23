export interface BaseModel <T> {
    id?: string;
    data: T;
    fechaCreacion: string;
    fechaModificacion?: string;
    creadoPor: DataUserModel;
    modificadoPor?: DataUserModel;
}

export interface DataUserModel {
    uid: string;
    email: string;
}