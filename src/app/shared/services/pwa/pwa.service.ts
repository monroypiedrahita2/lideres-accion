import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class PwaService {
    private deferredPrompt: any;
    showInstallButton = false;

    constructor() {
        this.initPwaPrompt();
    }

    private initPwaPrompt() {
        if (typeof window !== 'undefined') {
            window.addEventListener('beforeinstallprompt', (e) => {
                // Prevent the mini-infobar from appearing on mobile
                e.preventDefault();
                // Stash the event so it can be triggered later.
                this.deferredPrompt = e;
                // Update UI notify the user they can install the PWA
                this.showInstallButton = true;
            });

            // Optionally listen for appinstalled event
            window.addEventListener('appinstalled', () => {
                this.showInstallButton = false;
                this.deferredPrompt = null;
                console.log('PWA was installed');
            });
        }
    }

    async installPwa() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                this.deferredPrompt = null;
                this.showInstallButton = false;
            }
        }
    }
}
