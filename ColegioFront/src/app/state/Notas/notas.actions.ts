import { createAction, props } from "@ngrx/store";
import { Notas } from "../../models/notas.models";

export const cargarNotas = createAction(
    '[Notas List] Cargar Notas'
);

export const cargarNotasSuccess = createAction(
    '[Notas List] Cargar Notas Success',
    props<{ notas: Notas[] }>()
)

export const cargarNotasFailure = createAction(
    '[Notas List] Cargar Notas Failure',
    props<{ error: any }>()
);