import { createAction, props } from '@ngrx/store';
import { Asignaturas } from '../../models/asignaturas.model';

export const cargarAsignaturas = createAction(
    '[Asignaturas List] Cargar Asignaturas'
);

export const cargarAsignaturasSuccess = createAction(
    '[Asignaturas List] Cargar Asignaturas Success',
    props<{ asignaturas: Asignaturas[] }>()
)

export const cargarAsignaturasFailure = createAction(
    '[Asignaturas List] Cargar Asignaturas Failure',
    props<{ error: any }>()
);
