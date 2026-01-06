import { CardModel } from '../../../models/utils/card.model';

export const CARDS_HOME: CardModel[] = [
  {
    goTo: '/private/control-accesos',
    title: 'Control y accesos',
    description: 'Gestionar el control y los accesos',
    icon: 'lock',
    showIf: ['Pastor', 'Super usuario'],
  },
  {
    goTo: '/private/crear-pastor',
    title: 'Crear pastor',
    description: 'Asignar un pastor a iglesia',
    icon: 'record_voice_over',
    showIf: ['Super usuario'],
  },
  {
    goTo: '/private/crear-iglesia',
    title: 'Iglesia',
    description: 'Ver y gestionar iglesias',
    icon: 'favorite',
    showIf: ['Super usuario'],
  },
  {
    goTo: '/private/listar-comunas',
    title: 'Comunas y Barrios',
    description: 'Listar, eliminar o editar barrios y comunas',
    icon: 'location_city',
    showIf: ['Pastor', 'Coordinador de iglesia'],
  },
  {
    goTo: '/private/crear-comuna',
    title: 'Añadir Barrios',
    description: 'Crear una nueva comuna',
    icon: 'location_city',
    showIf: ['Pastor', 'Coordinador de iglesia'],
  },
  {
    goTo: '/private/masivo-referidos',
    title: 'Carga masiva',
    description: 'Carga masiva de referidos a través de un archivo Excel',
    icon: 'upload_file',
    showIf: ['Super usuario', 'Pastor'],
  },
  {
    goTo: '/private/listar-voluntarios',
    title: 'Voluntarios Iglesia',
    description: 'Listar y adminstrar voluntarios de la iglesia',
    icon: 'groups',
    showIf: ['Pastor', 'Coordinador de iglesia'],
  },
  // {
  //   goTo: '/private/crear-lider',
  //   title: 'Crear líder',
  //   description: 'Crear líderes',
  //   icon: 'person_add'
  // }
  {
    goTo: '/private/estadisticas',
    title: 'Estadisticas',
    description: 'Estadisticas por iglesia',
    icon: 'data_usage',
    showIf: ['Pastor', 'Super Usuario']
  },
  {
    goTo: '/private/dashboards',
    title: 'DashBoard',
    description: 'Estadisticas generales',
    icon: 'developer_board',
    showIf: ['Super Usuario']
  },
  {
    goTo: '',
    title: 'Apoyo vehicular',
    description: 'Administrar datos de apoyo vehicular',
    icon: 'directions_car',
    showIf: ['Todos'],
    action: 'vehiculo',
    requiresPostulacion: 'transporte'
  },
  {
    goTo: '',
    title: 'Casas de apoyo',
    description: 'Puntos centrales de apoyo',
    icon: 'my_location',
    showIf: ['Todos'],
    action: 'casa-apoyo',
    requiresPostulacion: 'casaApoyo'
  },
  {
    goTo: '',
    title: 'Gestión de testigos',
    description: 'Realiza tus gestiones como testigo aquí',
    icon: 'how_to_vote',
    showIf: ['Todos'],
    action: 'testigo',
    requiresPostulacion: 'testigo'
  }
];
