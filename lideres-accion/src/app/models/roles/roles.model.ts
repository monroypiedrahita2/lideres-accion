export interface RolesModel {
    nombre: string;
    permisos: PermisosModel;
}



export interface PermisosModel {
      UsuariosTodos?: boolean;
      UsuariosDepartamento?: boolean;
      UsuariosMunicipio?: boolean;
      UsuariosIglesia?: boolean;
      UsuariosComuna?: boolean;

      // Refridos
      ReferidosTodos?: boolean;
      ReferidosDepartamento?: boolean;
      ReferidosMunicipio?: boolean;
      ReferidosIglesia?: boolean;
      ReferidosComuna?: boolean;



      // Permisos
      PermisosTodos?: boolean;
      PermisosDepartamento?: boolean;
      PermisosMunicipio?: boolean;
      PermisosIglesia?: boolean;
      PermisosComuna?: boolean;

      //Iglesias
      IglesiasTodas?: boolean;
      IglesiasDepartamento?: boolean;
      IglesiasMunicipio?: boolean;
      IglesiasComuna?: boolean;

      //Comunas
      ComunasTodas?: boolean;
      ComunasDepartamento?: boolean;
      ComunasMunicipio?: boolean;

}
