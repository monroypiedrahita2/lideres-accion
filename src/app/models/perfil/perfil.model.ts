export interface PerfilModel {
  id?: string;
  nombres: string;
  apellidos: string;
  iglesia?: string; // solo lo puede administrar el Pastor y Super Usuario y coordinador de iglesia
  celular?: string;
  nameIglesia?: string;
  email: string;
  rol: 'Pastor' | 'Super Usuario' | string | null; // solo lo puede administrar el Pastor y Super Usuario
  postulado?: PostuladoModel; // solo lo puede Crear administrar y eliminar el mismo usuario
  coordinadorCasaApoyo?: boolean | null;  // solo lo puede Crear administrar y eliminar el Pastor
  coordinadorTransporte?: boolean | null; // solo lo puede Crear administrar y eliminar el Pastor
  administradorTestigos?: boolean | null; // solo lo puede Crear administrar y eliminar el Pastor
  noCuenta: string; // dato random alfanumerico de 6 caracteres no editable
  foto?: string; // foto se toma de authService de foto
  apruebaUsodeDatos?: boolean; // campo para aprobar uso de datos
}

export interface AsigmentRolePerfilModel {
  rol: 'Pastor' | 'Super Usuario' | string | null;
  iglesia: string;
}

export interface PostuladoModel {
  casaApoyo: boolean;
  transporte: boolean;
  testigo: boolean;
}

