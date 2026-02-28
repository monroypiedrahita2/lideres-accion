import { HttpClientModule } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SwUpdate, VersionEvent } from '@angular/service-worker';
import { ToastrService } from 'ngx-toastr';
import { NotificationService } from './ui/shared/services/notification/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private updateCheckInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly swUpdate: SwUpdate,
    private readonly toastr: ToastrService,
    private readonly notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    // 1. Verificar que el Service Worker esté habilitado
    if (this.swUpdate.isEnabled) {

      // 2. Suscribirse a eventos de versión
      this.swUpdate.versionUpdates.subscribe((event: VersionEvent) => {
        if (event.type === 'VERSION_READY') {
          // Nueva versión lista: notificar y forzar actualización
          this.promptUpdate();
        }

        if (event.type === 'VERSION_INSTALLATION_FAILED') {
          console.error('SW: Falló la instalación de la nueva versión', event);
        }
      });

      // 3. Manejar estado irrecuperable del Service Worker
      this.swUpdate.unrecoverable.subscribe((event: { reason: string }) => {
        console.error('SW: Estado irrecuperable', event.reason);
        this.toastr.error(
          'La aplicación necesita recargarse para funcionar correctamente.',
          'Error de caché',
          { disableTimeOut: true, closeButton: false, tapToDismiss: false }
        );
        setTimeout(() => document.location.reload(), 3000);
      });

      // Verificar actualizaciones de inmediato
      this.swUpdate.checkForUpdate().catch((err: unknown) =>
        console.error('SW: Error al verificar actualización', err)
      );

      // Verificar actualizaciones periódicamente (cada 30 segundos)
      this.updateCheckInterval = setInterval(() => {
        this.swUpdate.checkForUpdate().catch((err: unknown) =>
          console.error('SW: Error al verificar actualización periódica', err)
        );
      }, 30 * 1000);
    }
  }

  ngOnDestroy(): void {
    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval);
    }
  }

  private promptUpdate(): void {
    const message = 'Actualizando aplicación a la nueva versión...';

    this.toastr.info(message, 'Actualización Obligatoria', {
      disableTimeOut: true,
      progressBar: true,
      closeButton: false,
      tapToDismiss: false
    });

    // Esperar 3 segundos para que el usuario lea el mensaje, luego forzar actualización
    setTimeout(async () => {
      await this.swUpdate.activateUpdate();
      // Limpiar caches del SW para garantizar que index.html se traiga fresco del servidor
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
      }
      document.location.reload();
    }, 3000);
  }
}

