import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class LocationService {
    private userLocation: { lat: number, lng: number } | null = null;
    private locationPromise: Promise<{ lat: number, lng: number }> | null = null;

    constructor() { }

    getUserLocation(): Promise<{ lat: number, lng: number }> {
        // If we already have the location, return it immediately
        if (this.userLocation) {
            return Promise.resolve(this.userLocation);
        }

        // If a request is already in progress, return the existing promise
        if (this.locationPromise) {
            return this.locationPromise;
        }

        // Otherwise, start a new request
        this.locationPromise = new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        this.userLocation = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };
                        this.locationPromise = null; // Clear the promise once resolved
                        resolve(this.userLocation);
                    },
                    (error) => {
                        console.error('Error getting location', error);
                        this.locationPromise = null; // Clear the promise on error
                        reject(error);
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0 // We can adjust this if we want to accept slightly older cached positions from the browser itself
                    }
                );
            } else {
                this.locationPromise = null;
                reject(new Error('Geolocation not supported'));
            }
        });

        return this.locationPromise;
    }

    // Optional: Method to force refresh if needed (e.g., user moved significantly)
    refreshLocation(): Promise<{ lat: number, lng: number }> {
        this.userLocation = null;
        this.locationPromise = null;
        return this.getUserLocation();
    }
}
