export interface RolesModel {
    nombre: string;
    nivel: number;
    permisos?: PermisosModel;
}



export interface PermisosModel {
  // Usuarios
  usuariosTodos?: boolean;
  usuariosDepartamento?: boolean;
  usuariosMunicipio?: boolean;
  usuariosIglesia?: boolean;
  usuariosComuna?: boolean;

  // Referidos
  referidosTodos?: boolean;
  referidosDepartamento?: boolean;
  referidosMunicipio?: boolean;
  referidosIglesia?: boolean;
  referidosComuna?: boolean;

  // Permisos
  permisosTodos?: boolean;
  permisosDepartamento?: boolean;
  permisosMunicipio?: boolean;
  permisosIglesia?: boolean;
  permisosComuna?: boolean;

  // Iglesias
  crearIglesias?: boolean;
  editarIglesias?: boolean;
  eliminarIglesias?: boolean;

  // Comunas
  crearComunas?: boolean;
  editarComunas?: boolean;
  eliminarComunas?: boolean;

}
