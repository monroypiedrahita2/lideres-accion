export interface PerfilModel  {
  id?: string;
  documento: string;
  nombres: string;
  apellidos: string;
  iglesia?: string;
  nameIglesia?: string;
  email: string;
  rol: string | null;
  postulado: PostuladoModel;
}

export interface AsigmentRolePerfilModel {
  rol: string | null;
  iglesia: string;
}

export interface PostuladoModel {
  casaApoyo: boolean;
  transporte: boolean;
  testigo: boolean;
}
