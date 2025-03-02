export interface UserSettings {
  darkMode: boolean;
  language: string;
  notifications: boolean;
  sidebarExpanded: boolean;
  fontSize: 'small' | 'medium' | 'large';
  colorTheme: string;
}

export const defaultUserSettings: UserSettings = {
  darkMode: false,
  language: 'en',
  notifications: true,
  sidebarExpanded: true,
  fontSize: 'medium',
  colorTheme: 'default'
}; 