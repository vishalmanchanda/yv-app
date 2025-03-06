# ShellApp

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.2.12.

# Shell Features

-Centralized authentication and authorization
User authentication
Route protection
Token management
Permission checking
Login UI
HTTP interceptor for auth headers
-Shared state management between MFEs
-Inter-MFE communication
-Consistent error handling
-Theme customization
-Loading indicators
Global loading indicator
Automatic HTTP request handling
Manual control when needed
Stacked loading requests (counter)
Custom loading messages
Blur effect overlay
Smooth animations
Theme-aware styling
-Configuration management
-Notifications system
Different types of notifications (success, error, warning, info)
Auto-dismissing notifications
Click to dismiss
Animated transitions
Theme-aware styling
Stacked notifications
Custom icons for each type
Optional titles
Customizable duration
-Global Error Handler
Global error catching
Custom error pages (404, generic error)
Error notifications
Error logging
Route handling for non-existent pages
Theme-aware error pages
-BreadCrumb Component
Automatic breadcrumb generation from routes
Manual breadcrumb control when needed
Icons support
Theme-aware styling
Responsive design
Home link
Click navigation
Route data integration

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

# Adding a Micro-Frontend to the Shell

This guide outlines the process for adding a new micro-frontend (MFE) to the Application.

## Embedded MFE Process

1. **Create the MFE Component**

   - Create a new directory under `src/app/mfes/{mfe-name}/`
   - Implement the main component and any supporting components
   - Create services needed by the MFE

2. **Create an MFE Wrapper Component**

   - Create a wrapper component that will serve as the entry point
   - This component will handle integration with the shell

3. **Add to Routing**

   - Add the MFE to the shell's routing configuration
   - Configure any route guards or data as needed

4. **Add Global Access (Optional)**
   - For MFEs that need global access (like the chatbot), add them to the shell layout
   - Create a service to manage the MFE's state and visibility

## Extracting an MFE

When you're ready to extract an MFE into a separate application:

1. **Create a New Angular Application**

   - Use Angular CLI to create a new application
   - Configure Module Federation in the webpack config

2. **Move the MFE Code**

   - Move the MFE directory to the new application
   - Update imports and dependencies as needed

3. **Configure the Shell**
   - Update the shell's Module Federation config to consume the remote MFE
   - Update routing to load the MFE from the remote source

## Example: Chatbot MFE

The Chatbot MFE demonstrates this process:

- Components: `ChatbotComponent`, `ChatbotMfeComponent`
- Services: `ChatbotService`
- Integration: Added to shell layout with toggle in navbar
- Future extraction: Module Federation configuration ready
