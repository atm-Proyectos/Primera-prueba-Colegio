import { createReducer, on } from '@ngrx/store';
import { Asignaturas } from '../../models/asignaturas.model';
import * as AsignaturasActions from './asignaturas.actions';

export interface AsignaturasState {
    loading: boolean;
    asignaturas: Asignaturas[];
    error: any;
}

export const initialState: AsignaturasState = {
    loading: false,
    asignaturas: [],
    error: null
};

export const asignaturasReducer = createReducer(
    initialState,

    on(AsignaturasActions.cargarAsignaturas, (state) => ({
        ...state,
        loading: true
    })),

    on(AsignaturasActions.cargarAsignaturasSuccess, (state, { asignaturas }) => ({
        ...state,
        loading: false,
        asignaturas: asignaturas
    })),

    on(AsignaturasActions.cargarAsignaturasFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error: error
    }))
);
