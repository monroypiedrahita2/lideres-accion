import { CardModel } from '../../../models/utils/card.model';

export const CARDS_HOME: CardModel[] = [
  {
    goTo: '../control-accesos',
    title: 'Control y accesos',
    description: 'Gestionar el control y los accesos',
    icon: 'lock',
    showIf: ['Pastor', 'Super usuario'],
  },
  {
    goTo: '../crear-pastor',
    title: 'Crear pastor',
    description: 'Asignar un pastor a iglesia',
    icon: 'record_voice_over',
    showIf: ['Super usuario'],
  },
  {
    goTo: '../crear-iglesia',
    title: 'Iglesia',
    description: 'Ver y gestionar iglesias',
    icon: 'favorite',
    showIf: ['Super usuario'],
  },
  {
    goTo: '../listar-comunas',
    title: 'Comunas y Barrios',
    description: 'Listar, eliminar o editar barrios y comunas',
    icon: 'location_city',
    showIf: ['Pastor', 'Coordinador de iglesia'],
  },
  {
    goTo: '../crear-comuna',
    title: 'Añadir Barrios',
    description: 'Crear una nueva comuna',
    icon: 'location_city',
    showIf: ['Pastor', 'Coordinador de iglesia'],
  },
  {
    goTo: '../masivo-referidos',
    title: 'Carga masiva',
    description: 'Carga masiva de referidos a través de un archivo Excel',
    icon: 'upload_file',
    showIf: ['Super usuario', 'Pastor'],
  },
  {
    goTo: '../listar-voluntarios',
    title: 'Voluntarios Iglesia',
    description: 'Listar y adminstrar voluntarios de la iglesia',
    icon: 'groups',
    showIf: ['Pastor', 'Coordinador de iglesia'],
  },
  // {
  //   goTo: '../crear-lider',
  //   title: 'Crear líder',
  //   description: 'Crear líderes',
  //   icon: 'person_add'
  // }
];
