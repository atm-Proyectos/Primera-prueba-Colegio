import { createAction, props } from '@ngrx/store';

export const cargarStats = createAction(
    '[Dashboard] Cargar Stats'
);

export const cargarStatsSuccess = createAction(
    '[Dashboard] Cargar Stats Success',
    props<{ stats: any }>()
);

export const cargarStatsFailure = createAction(
    '[Dashboard] Cargar Stats Failure',
    props<{ error: any }>()
);