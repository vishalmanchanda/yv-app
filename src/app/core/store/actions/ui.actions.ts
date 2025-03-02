import { createAction, props } from '@ngrx/store';

export const setTheme = createAction(
  '[UI] Set Theme',
  props<{ theme: 'light' | 'dark' }>()
);

export const toggleSidebar = createAction('[UI] Toggle Sidebar');

export const setSidebarState = createAction(
  '[UI] Set Sidebar State',
  props<{ expanded: boolean }>()
);

export const setLoading = createAction(
  '[UI] Set Loading State',
  props<{ loading: boolean }>()
);

export const setCurrentMfe = createAction(
  '[UI] Set Current MFE',
  props<{ mfeId: string | null }>()
); 