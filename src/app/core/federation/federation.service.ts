import { Injectable } from '@angular/core';
import { ConfigService } from '../services/config.service';

// Add this declaration for webpack module federation
declare const __webpack_share_scopes__: { default: any };

@Injectable({
  providedIn: 'root'
})
export class FederationService {
  constructor(private configService: ConfigService) {}

  async loadRemoteModule(remoteName: string, exposedModule: string) {
    const remoteUrl = this.configService.getMfeUrl(remoteName);
    
    // Load the remote entry script
    await this.loadRemoteEntry(remoteUrl);
    
    // Get the container from window
    const container = (window as any)[remoteName];
    
    // Initialize the container sharing scope
    await container.init(__webpack_share_scopes__.default);
    
    // Get the factory for the exposed module
    const factory = await container.get(exposedModule);
    
    // Return the module
    return factory();
  }

  private async loadRemoteEntry(remoteUrl: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `${remoteUrl}/remoteEntry.js`;
      script.type = 'text/javascript';
      script.onload = () => resolve();
      script.onerror = (error) => reject(error);
      document.head.appendChild(script);
    });
  }
} 