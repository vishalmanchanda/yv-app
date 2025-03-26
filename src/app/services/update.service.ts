import { Injectable } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UpdateService {

  constructor(private swUpdate: SwUpdate) {
    this.checkForUpdates();
  }

  checkForUpdates(): void {
    if (this.swUpdate.isEnabled) {
      // Subscribe to version updates
      this.swUpdate.versionUpdates
        .pipe(
          filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY')
        )
        .subscribe(evt => {
          // Prompt user to update
          if (confirm(`A new version of the app is available. The current version is ${evt.currentVersion.hash} and the available version is ${evt.latestVersion.hash}. Load the new version?`)) {
            // Reload the page to update to the latest version
            window.location.reload();
          }
        });

      // Check for updates every 6 hours
      setInterval(() => {
        this.swUpdate.checkForUpdate()
          .then(() => console.log('Checking for updates'))
          .catch(err => console.error('Error checking for updates:', err));
      }, 6 * 60 * 60 * 1000);
    }
  }
} 