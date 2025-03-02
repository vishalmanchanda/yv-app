import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../app.state';
import * as UiActions from '../actions/ui.actions';
import * as UiSelectors from '../selectors/ui.selectors';

@Injectable({
  providedIn: 'root'
})
export class UiFacade {
  readonly theme$;
  readonly sidebarExpanded$;
  readonly loading$;
  readonly currentMfe$;

  constructor(private store: Store<AppState>) {
    this.theme$ = this.store.select(UiSelectors.selectTheme);
    this.sidebarExpanded$ = this.store.select(UiSelectors.selectSidebarExpanded);
    this.loading$ = this.store.select(UiSelectors.selectLoading);
    this.currentMfe$ = this.store.select(UiSelectors.selectCurrentMfe);
  }

  setTheme(theme: 'light' | 'dark') {
    this.store.dispatch(UiActions.setTheme({ theme }));
  }

  toggleSidebar() {
    this.store.dispatch(UiActions.toggleSidebar());
  }

  setSidebarState(expanded: boolean) {
    this.store.dispatch(UiActions.setSidebarState({ expanded }));
  }

  setLoading(loading: boolean) {
    this.store.dispatch(UiActions.setLoading({ loading }));
  }

  setCurrentMfe(mfeId: string | null) {
    this.store.dispatch(UiActions.setCurrentMfe({ mfeId }));
  }
} 