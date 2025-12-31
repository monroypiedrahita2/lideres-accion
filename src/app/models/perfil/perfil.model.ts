export interface PerfilModel {
  id?: string;
  documento: string;
  nombres: string;
  apellidos: string;
  iglesia?: string; // solo lo puede administrar el Pastor y Super Usuario y coordinador de iglesia
  celular?: string;
  nameIglesia?: string;
  email: string;
  rol: string | null; // solo lo puede administrar el Pastor y Super Usuario
  barrioDondeVive: string;
  postulado?: PostuladoModel; // solo lo puede Crear administrar y eliminar el mismo usuario
  coordinadorCasaApoyo?: string | null;  // solo lo puede Crear administrar y eliminar el Pastor
  coordinadorTransporte?: boolean | null; // solo lo puede Crear administrar y eliminar el Pastor
  coordinadorTestigos?: boolean | null; // solo lo puede Crear administrar y eliminar el Pastor
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

