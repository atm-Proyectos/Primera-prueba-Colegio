import { createReducer, on } from '@ngrx/store';
import { cargarStats, cargarStatsSuccess, cargarStatsFailure } from './dashboard.actions';

export interface DashboardState {
    stats: any | null;
    loading: boolean;
    error: any;
}

export const initialState: DashboardState = {
    stats: null,
    loading: false,
    error: null
};

export const dashboardReducer = createReducer(
    initialState,
    on(cargarStats, (state) => ({ ...state, loading: true })),

    on(cargarStatsSuccess, (state, { stats }) => ({
        ...state,
        loading: false,
        stats: stats
    })),

    on(cargarStatsFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error: error
    }))
);