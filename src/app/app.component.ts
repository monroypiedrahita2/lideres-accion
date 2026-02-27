import { HttpClientModule } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SwUpdate, VersionEvent } from '@angular/service-worker';
import { ToastrService } from 'ngx-toastr';
import { NotificationService } from './ui/shared/services/notification/notification.service';

const UPDATE_CHECK_INTERVAL = 2 * 60 * 1000; // 2 minutos

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private updateCheckTimer: ReturnType<typeof setInterval> | null = null;
  private readonly onVisibilityChange = () => this.handleVisibilityChange();

  constructor(
    private readonly swUpdate: SwUpdate,
    private readonly toastr: ToastrService,
    private readonly notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    if (!this.swUpdate.isEnabled) {
      return;
    }

    // 1. Suscribirse a todos los eventos de versión
    this.swUpdate.versionUpdates.subscribe((event: VersionEvent) => {
      switch (event.type) {
        case 'VERSION_READY':
          this.promptUpdate();
          break;
        case 'VERSION_INSTALLATION_FAILED':
          console.error('SW: Falló la instalación de la nueva versión:', event.error);
          // Reintentar en el siguiente ciclo de polling
          break;
      }
    });

    // 2. Verificación inmediata al iniciar
    this.safeCheckForUpdate();

    // 3. Polling periódico: detectar deploys mientras la app está abierta
    this.updateCheckTimer = setInterval(() => this.safeCheckForUpdate(), UPDATE_CHECK_INTERVAL);

    // 4. Verificar al volver a la pestaña (usuario regresa después de un rato)
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.onVisibilityChange);
    }
  }

  ngOnDestroy(): void {
    if (this.updateCheckTimer) {
      clearInterval(this.updateCheckTimer);
    }
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.onVisibilityChange);
    }
  }

  private handleVisibilityChange(): void {
    if (document.visibilityState === 'visible') {
      this.safeCheckForUpdate();
    }
  }

  private safeCheckForUpdate(): void {
    this.swUpdate.checkForUpdate().catch((err: unknown) =>
      console.error('SW: Error al verificar actualizaciones:', err)
    );
  }

  private promptUpdate(): void {
    const message = 'Actualizando aplicación a la nueva versión...';

    this.toastr.info(message, 'Actualización Obligatoria', {
      timeOut: 2000,
      progressBar: true,
      closeButton: false,
      disableTimeOut: false,
      tapToDismiss: false
    });

    setTimeout(() => {
      this.swUpdate.activateUpdate().then(() => document.location.reload());
    }, 3000);
  }
}

