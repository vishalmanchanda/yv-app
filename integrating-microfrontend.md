# Integrating a New Micro Frontend into the Shell Application

This guide outlines the steps to add and integrate a new micro frontend (MFE) into the shell application.

## Prerequisites

- Node.js and npm installed
- Angular CLI installed
- Access to the shell application repository
- Understanding of Module Federation concepts

## Step-by-Step Integration Guide

### 1. Create the Micro Frontend Application

```bash
# Create a new Angular application for your micro frontend
ng new my-new-feature --routing=true --style=scss

# Navigate to the new project
cd my-new-feature

# Add Module Federation capabilities
ng add @angular-architects/module-federation --project my-new-feature --port 4201
```

### 2. Configure the Micro Frontend for Module Federation

Edit the `webpack.config.js` file in your micro frontend project:

```javascript
const { shareAll } = require('@angular-architects/module-federation/webpack');

module.exports = {
  output: {
    uniqueName: "myNewFeature",
    publicPath: "auto"
  },
  optimization: {
    runtimeChunk: false
  },
  resolve: {
    alias: {
      ...sharedMappings.getAliases(),
    }
  },
  experiments: {
    outputModule: true
  },
  plugins: [
    new ModuleFederationPlugin({
      library: { type: "module" },
      name: "myNewFeature",
      filename: "remoteEntry.js",
      exposes: {
        './Module': './src/app/remote-entry/entry.module.ts',
      },
      shared: shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' })
    }),
    sharedMappings.getPlugin()
  ],
};
```

### 3. Create the Remote Entry Module

Create a new module in your micro frontend that will be exposed to the shell:

```bash
ng g module remote-entry --routing
```

Edit the `remote-entry/entry.module.ts`:

```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EntryComponent } from './entry.component';

@NgModule({
  declarations: [
    EntryComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: EntryComponent
      }
    ])
  ]
})
export class RemoteEntryModule { }
```

Create an entry component:

```bash
ng g component remote-entry/entry
```

### 4. Update the Shell Application Configuration

#### 4.1. Add the MFE to the Shell's webpack.config.js

Edit the shell's `webpack.config.js` to include the new micro frontend:

```javascript
// ... existing code ...
plugins: [
  new ModuleFederationPlugin({
    // ... existing remotes ...
    remotes: {
      // ... existing remotes ...
      myNewFeature: "myNewFeature@http://localhost:4201/remoteEntry.js",
    },
    // ... existing shared configuration ...
  }),
  // ... existing code ...
]
```

#### 4.2. Update the Shell's Configuration Service

Add the new micro frontend to the configuration service:

```typescript
// In the shell's configuration service or environment files
export const microFrontendConfig = {
  // ... existing MFEs ...
  myNewFeature: {
    remoteEntry: 'http://localhost:4201/remoteEntry.js',
    remoteName: 'myNewFeature',
    exposedModule: './Module',
    displayName: 'My New Feature',
    routePath: 'my-new-feature',
    ngModuleName: 'RemoteEntryModule'
  }
}
```

### 5. Add Routing in the Shell Application

Update the shell's routing module to load the new micro frontend:

```typescript
// In the shell's app-routing.module.ts
const routes: Routes = [
  // ... existing routes ...
  {
    path: 'my-new-feature',
    loadChildren: () => loadRemoteModule({
      type: 'module',
      remoteEntry: environment.microFrontends.myNewFeature.remoteEntry,
      exposedModule: environment.microFrontends.myNewFeature.exposedModule
    })
    .then(m => m[environment.microFrontends.myNewFeature.ngModuleName])
  }
];
```

### 6. Add Navigation Link in the Shell

Update the shell's navigation components to include a link to the new micro frontend:

```typescript
// In the shell's navigation service or component
navigationItems = [
  // ... existing navigation items ...
  {
    label: 'My New Feature',
    icon: 'feature_icon',
    route: '/my-new-feature',
    permission: 'access:my-new-feature' // If using permissions
  }
];
```

### 7. Set Up Communication Between Shell and MFE

#### 7.1. In the Micro Frontend

Create a service to handle communication with the shell:

```typescript
// In the MFE project
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShellCommunicationService {
  private eventBus = new Subject<any>();
  public events$ = this.eventBus.asObservable();

  sendEventToShell(eventType: string, payload: any) {
    const event = { type: eventType, payload };
    // Use window.dispatchEvent for shell communication
    window.dispatchEvent(new CustomEvent('mfe-event', { detail: event }));
  }

  receiveEventFromShell(event: any) {
    this.eventBus.next(event);
  }
}
```

#### 7.2. In the Shell Application

Update the shell's event service to handle events from the new MFE:

```typescript
// In the shell's event service
@HostListener('window:mfe-event', ['$event'])
handleMfeEvent(event: CustomEvent) {
  const { type, payload } = event.detail;
  
  // Process the event based on type
  switch (type) {
    case 'myNewFeature:someAction':
      // Handle the event
      this.processFeatureEvent(payload);
      break;
    // ... other event types ...
  }
}
```

### 8. Share Authentication and User Context

Ensure the micro frontend can access the shell's authentication context:

```typescript
// In the MFE's authentication service
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  getCurrentUser() {
    // Access the shell's auth data from window object or localStorage
    return (window as any).shellAuth?.currentUser || JSON.parse(localStorage.getItem('user') || '{}');
  }

  isAuthenticated() {
    return !!this.getCurrentUser().id;
  }
}
```

### 9. Apply Consistent Styling

Ensure your micro frontend uses the same styling approach as the shell:

```scss
/* In the MFE's styles.scss */
@import 'variables';

// Use the same CSS variables as the shell
:host {
  --primary-color: var(--shell-primary-color, #007bff);
  --secondary-color: var(--shell-secondary-color, #6c757d);
  // ... other variables ...
}

// Apply consistent component styling
.my-component {
  background-color: var(--primary-color);
  color: var(--text-color);
  // ... other styles ...
}
```

### 10. Test the Integration

1. Start both applications:
```bash
# In the shell directory
npm start

# In the MFE directory
npm start
```

2. Navigate to the shell application (typically http://localhost:4200)
3. Click on the navigation link for your new feature
4. Verify that the micro frontend loads correctly
5. Test communication between the shell and MFE
6. Verify that authentication and styling are working properly

### 11. Deployment Considerations

- Update the remoteEntry URLs in production configurations to point to the deployed MFE URLs
- Ensure CORS is properly configured if the shell and MFEs are deployed to different domains
- Consider using a versioning strategy for your MFEs to manage updates
- Implement health checks for MFEs to handle unavailability gracefully

## Troubleshooting Common Issues

- **Module not found errors**: Ensure the remote entry path and module name match exactly what's exposed in the MFE's webpack config
- **Styling inconsistencies**: Check that the MFE is properly importing and using the shell's theme variables
- **Authentication issues**: Verify that the MFE can access the shell's authentication tokens
- **Communication failures**: Ensure event names are consistent between the shell and MFE
- **Version conflicts**: Check for shared dependency version mismatches between the shell and MFE