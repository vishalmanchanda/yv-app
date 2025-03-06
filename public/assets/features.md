# Shell Application Features

## 📋 Feature List

- Authentication System
- Responsive Layout with Shell Structure
- Navigation Components
  - Navbar
  - Sidebar
  - Breadcrumbs
- Theme Management
- Loading Indicator
- Toast Notifications
- Error Handling
- Micro Frontend Integration
- Event Communication System
- Routing and Navigation
- State Management with NgRx
- User Profile Management
- Configuration Management

---

## 🔍 Feature Overview

### 🔐 Authentication System

The shell application includes a complete authentication system with login, logout, and session management. It uses JWT tokens for secure API communication and includes route guards to protect private routes. The authentication state is managed centrally and shared with micro frontends.

**Key components:**

- `AuthService` for login/logout operations and user state management
- `AuthGuard` for protecting routes
- `AuthInterceptor` for adding authentication tokens to API requests
- Mock authentication for development and testing

### 📱 Responsive Layout with Shell Structure

The application uses a responsive shell layout that adapts to different screen sizes. The layout includes:

- Fixed header with navigation
- Collapsible sidebar
- Main content area
- Optional footer

The layout is built with Bootstrap 5 and custom CSS to ensure proper display on desktop, tablet, and mobile devices.

### 🧭 Navigation Components

#### Navbar

The top navigation bar provides:

- Application branding
- Main navigation links
- Theme toggle button
- Search functionality
- Notifications indicator
- User profile menu with quick actions

#### Sidebar

The collapsible sidebar offers:

- Context-specific navigation
- Expandable/collapsible design for desktop and mobile
- Visual indicators for active routes
- Icon and text labels for navigation items

#### Breadcrumbs

The breadcrumb system:

- Automatically generates navigation paths based on routes
- Supports custom breadcrumb definitions via route data
- Provides context awareness for users
- Includes optional icons for visual enhancement

### 🎨 Theme Management

The application includes a theme management system that:

- Supports light and dark modes
- Uses CSS variables for consistent styling
- Allows runtime theme switching without page reload
- Persists user theme preferences

### ⏳ Loading Indicator

A global loading indicator shows when:

- API requests are in progress
- Route changes are occurring
- Long operations are running

The system uses an HTTP interceptor to automatically show/hide the spinner during API calls.

### 🔔 Toast Notifications

The notification system provides:

- Success, error, warning, and info message types
- Configurable display duration
- Automatic dismissal
- Manual dismissal option
- Stacking of multiple notifications

### ⚠️ Error Handling

The application includes a comprehensive error handling system:

- Global error handler for uncaught exceptions
- HTTP error interceptor for API errors
- User-friendly error messages
- Error logging
- Navigation to error pages for critical errors

### 🧩 Micro Frontend Integration

The shell supports integration with micro frontends through:

- Module Federation for loading remote modules
- Configuration-based MFE URLs
- Communication bridge between shell and MFEs
- Shared authentication state
- Consistent styling and theming

### 📡 Event Communication System

The application includes an event bus system for:

- Shell-to-MFE communication
- MFE-to-Shell communication
- MFE-to-MFE communication
- Typed events with payload support
- Targeted or broadcast messaging

### 🔀 Routing and Navigation

The routing system provides:

- Lazy-loaded feature modules
- Route guards for authentication
- Route data for metadata (breadcrumbs, icons)
- Nested routes for complex UIs
- Wildcard route handling for 404 pages

### 📊 State Management with NgRx

The application uses NgRx for state management with:

- UI state management
- Router state integration
- DevTools integration for debugging
- Effects for side effects
- Selectors for derived state

### 👤 User Profile Management

User profile features include:

- Profile viewing and editing
- Password changing
- User preferences management
- Profile image handling
- Role and permission display

### ⚙️ Configuration Management

The application includes a configuration system that:

- Loads environment-specific settings
- Provides feature flags
- Configures API endpoints
- Defines MFE URLs
- Supports theme customization
