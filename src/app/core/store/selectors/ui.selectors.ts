import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UiState } from '../app.state';

export const selectUiState = createFeatureSelector<UiState>('ui');

export const selectTheme = createSelector(
  selectUiState,
  (state: UiState) => state.theme
);

export const selectSidebarExpanded = createSelector(
  selectUiState,
  (state: UiState) => state.sidebarExpanded
);

export const selectLoading = createSelector(
  selectUiState,
  (state: UiState) => state.loading
);

export const selectCurrentMfe = createSelector(
  selectUiState,
  (state: UiState) => state.currentMfe
); 