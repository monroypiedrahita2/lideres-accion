import { CardModel } from "../../../models/utils/card.model";

export const CARDS_HOME: CardModel[] = [
    {
        goTo: 'crear-referido',
        title: 'Crear referido',
        description: 'Crear un referido a voluntario',
        icon: 'dashboard'
    },
    {
        goTo: '../mi-perfil',
        title: 'Mi perfil',
        description: 'Ver y editar tu perfil',
        icon: 'person',
        activePoint: false
    },
    {
        goTo: 'control-y-accesos',
        title: 'Control y accesos',
        description: 'Gestionar el control y los accesos',
        icon: 'lock'
    },
    {
        goTo: '../settings',
        title: 'Configuraciones',
        description: 'Ajustar las configuraciones de la aplicación',
        icon: 'settings'
    },
    {
        goTo: '../crear-iglesia',
        title: 'Crear iglesia',
        description: 'Ver y gestionar iglesias',
        icon: 'church'
    },
    {
        goTo: 'comunas',
        title: 'Comunas',
        description: 'Ver y gestionar comunas',
        icon: 'location_city'
    }
]