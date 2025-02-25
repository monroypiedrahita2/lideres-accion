import { DocumentReference } from "@angular/fire/firestore";

export interface ComunaModel {
    nombre: string;
    municipio_id: number;
    responsable?: DocumentReference
    barrios: string[];
}
