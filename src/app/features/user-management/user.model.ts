export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  active: boolean;
  createdAt: string;
  lastLogin?: string;
} 