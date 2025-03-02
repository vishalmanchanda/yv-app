import { RouterReducerState } from '@ngrx/router-store';

export interface AppState {
  router: RouterReducerState;
  auth: AuthState;
  ui: UiState;
  notifications: NotificationState;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface UiState {
  theme: 'light' | 'dark';
  sidebarExpanded: boolean;
  loading: boolean;
  currentMfe: string | null;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  roles: string[];
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  read: boolean;
  timestamp: number;
} 