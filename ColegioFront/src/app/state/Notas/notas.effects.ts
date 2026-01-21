import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ApiService } from 'src/app/services/api.service';
import * as NotasActions from './notas.actions';
import { catchError, map, mergeMap, of } from 'rxjs';

@Injectable()
export class NotasEffects {
    constructor(
        private actions$: Actions,
        private apiService: ApiService
    ) { }

    cargarNotas$ = createEffect(() => this.actions$.pipe(
        ofType(NotasActions.cargarNotas),
        mergeMap(() => this.apiService.getNotas()
            .pipe(
                map(notas => NotasActions.cargarNotasSuccess({ notas })),
                catchError(error => of(NotasActions.cargarNotasFailure({ error })))
            ))
    )
    );
}