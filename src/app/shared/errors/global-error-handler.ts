import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
    handleError(error: any): void {
        const chunkFailedMessage = /Loading chunk [\d]+ failed/;
        const dynamicImportFailedMessage = /Failed to fetch dynamically imported module/;

        if (chunkFailedMessage.test(error.message) || dynamicImportFailedMessage.test(error.message)) {
            console.error('Error de carga de fragmento detectado. Forzando recarga de la aplicación...', error);

            // Opcional: Podríamos mostrar un mensaje al usuario antes de recargar
            // Pero en la mayoría de los casos de PWA/Chunk error, recargar de inmediato es lo mejor
            // para asegurar que el usuario tenga la versión correcta.

            // Añadimos una pequeña demora para evitar bucles de recarga infinitos si algo sale muy mal
            const lastReload = localStorage.getItem('last-chunk-error-reload');
            const now = Date.now();

            // Si no ha habido una recarga por este error en los últimos 10 segundos, recargamos
            if (!lastReload || now - parseInt(lastReload) > 10000) {
                localStorage.setItem('last-chunk-error-reload', now.toString());
                window.location.reload();
            } else {
                console.error('Se detectó un error de fragmento repetido en un corto periodo de tiempo. No se forzará la recarga para evitar bucles.');
            }
        } else {
            // Loguear otros errores normalmente
            console.error('Error no capturado:', error);
        }
    }
}
