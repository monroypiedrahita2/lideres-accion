import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
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
export class AppComponent implements OnInit {
  constructor(
    private readonly swUpdate: SwUpdate,
    private readonly toastr: ToastrService,
    private readonly notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    if (this.swUpdate.isEnabled) {
      console.log('Service Worker enabled');

      this.swUpdate.versionUpdates.subscribe((event: VersionEvent) => {
        console.log('Service Worker event:', event.type);
        if (event.type === 'VERSION_READY') {
          this.promptUpdate();
        }
      });

      // Check for update immediately on load
      this.swUpdate.checkForUpdate().then(hasUpdate => {
        console.log('Initial update check:', hasUpdate ? 'Update available' : 'No update');
      }).catch(err => {
        console.error('Error checking for update:', err);
      });

      // Optional: Periodic check every hour (3,600,000 ms)
      setInterval(() => {
        if (this.swUpdate.isEnabled) {
          this.swUpdate.checkForUpdate().then(hasUpdate => {
            if (hasUpdate) console.log('Periodic check: Update found');
          });
        }
      }, 3600000);
    }
  }

  private promptUpdate(): void {
    const message = 'Hay una nueva versión disponible. Actualizando...';

    this.toastr.info(message, 'Actualización', {
      timeOut: 5000,
      progressBar: true,
      closeButton: false,
      disableTimeOut: false,
      tapToDismiss: false
    });

    // Wait 5 seconds for the user to see the toast, then activate and reload
    setTimeout(() => {
      this.swUpdate.activateUpdate().then(() => {
        console.log('Update activated, reloading...');
        document.location.reload();
      });
    }, 5000);
  }
}

