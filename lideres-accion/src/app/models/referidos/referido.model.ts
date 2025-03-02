import { LiderModel } from '../lider/lider.model';

export interface ReferidoModel extends LiderModel {
  referidoPor: ReferidoPorModel;
  candidaturas: string[];
}


export interface ReferidoPorModel {
  nombre: string;
  documento: string;
}
