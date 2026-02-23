import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class PwaService {
    private deferredPrompt: any;
    showInstallButton = false;
    private platform = 'WEB';

    constructor() {
        this.initPwaPrompt();
        this.checkPlatform();
    }

    get currentPlatform() {
        return this.platform;
    }

    private checkPlatform() {
        if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
            const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
            if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
                this.platform = 'IOS';
                // Check if already installed (standalone mode)
                const isStandalone = ('standalone' in window.navigator) && (window.navigator as any).standalone;
                if (!isStandalone) {
                    this.showInstallButton = true; // Show button for iOS manual install
                }
            }
        }
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
                this.platform = 'ANDROID';
            });

            // Optionally listen for appinstalled event
            window.addEventListener('appinstalled', () => {
                this.showInstallButton = false;
                this.deferredPrompt = null;
            });
        }
    }

    /**
     * Triggers the install prompt or returns true if manual guide is needed
     */
    async installPwa(): Promise<boolean> {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                this.deferredPrompt = null;
                this.showInstallButton = false;
            }
            return false; // Handled automatically
        }
        // If no deferred prompt (e.g. iOS or manual case), return true to show guide
        return true;
    }
}
