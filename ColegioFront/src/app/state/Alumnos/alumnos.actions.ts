import { createAction, props } from "@ngrx/store";
import { Alumnos } from "../../models/alumnos.model";

export const cargarAlumnos = createAction(
    '[Alumnos List] Cargar Alumnos'
);

export const cargarAlumnosSuccess = createAction(
    '[Alumnos List] Cargar Alumnos Success',
    props<{ alumnos: Alumnos[] }>()
)

export const cargarAlumnosFailure = createAction(
    '[Alumnos List] Cargar Alumnos Failure',
    props<{ error: any }>()
);