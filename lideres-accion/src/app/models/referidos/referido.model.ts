import { LiderModel } from '../lider/lider.model';

export interface ReferidoModel extends LiderModel {
  referidoPor: string; // cc-nombres
  candidaturas: any[];
}



