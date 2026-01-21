import { createReducer, on } from '@ngrx/store';
import { Notas } from '../../models/notas.models';
import * as NotasActions from './notas.actions';

export interface NotasState {
    loading: boolean;
    notas: Notas[];
    error: any;
}

export const initialState: NotasState = {
    loading: false,
    notas: [],
    error: null
};

export const notasReducer = createReducer(
    initialState,

    on(NotasActions.cargarNotas, (state) => ({
        ...state,
        loading: true
    })),

    on(NotasActions.cargarNotasSuccess, (state, { notas }) => ({
        ...state,
        loading: false,
        notas: notas
    })),

    on(NotasActions.cargarNotasFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error: error
    }))
);
