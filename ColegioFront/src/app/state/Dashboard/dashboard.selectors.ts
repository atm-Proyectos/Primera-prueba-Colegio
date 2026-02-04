import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DashboardState } from './dashboard.reducer';

export const selectDashboardState = createFeatureSelector<DashboardState>('dashboard');

export const selectStats = createSelector(
    selectDashboardState,
    (state) => state.stats
);

export const selectLoading = createSelector(
    selectDashboardState,
    (state) => state.loading
);
