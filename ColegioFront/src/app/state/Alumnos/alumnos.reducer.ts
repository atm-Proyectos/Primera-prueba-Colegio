import { createReducer, on } from '@ngrx/store';
import { Alumnos } from '../../models/alumnos.model';
import * as AlumnosActions from './alumnos.actions';

export interface AlumnosState {
    loading: boolean;
    alumnos: Alumnos[];
    error: any;
}

export const initialState: AlumnosState = {
    loading: false,
    alumnos: [],
    error: null
};

export const alumnosReducer = createReducer(
    initialState,

    on(AlumnosActions.cargarAlumnos, (state) => ({
        ...state,
        loading: true
    })),

    on(AlumnosActions.cargarAlumnosSuccess, (state, { alumnos }) => ({
        ...state,
        loading: false,
        alumnos: alumnos
    })),

    on(AlumnosActions.cargarAlumnosFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error: error
    }))
);