import { createReducer, on } from '@ngrx/store';
import { UiState } from '../app.state';
import * as UiActions from '../actions/ui.actions';

export const initialState: UiState = {
  theme: 'light',
  sidebarExpanded: true,
  loading: false,
  currentMfe: null
};

export const uiReducer = createReducer(
  initialState,
  on(UiActions.setTheme, (state, { theme }) => ({
    ...state,
    theme
  })),
  on(UiActions.toggleSidebar, state => ({
    ...state,
    sidebarExpanded: !state.sidebarExpanded
  })),
  on(UiActions.setSidebarState, (state, { expanded }) => ({
    ...state,
    sidebarExpanded: expanded
  })),
  on(UiActions.setLoading, (state, { loading }) => ({
    ...state,
    loading
  })),
  on(UiActions.setCurrentMfe, (state, { mfeId }) => ({
    ...state,
    currentMfe: mfeId
  }))
); 