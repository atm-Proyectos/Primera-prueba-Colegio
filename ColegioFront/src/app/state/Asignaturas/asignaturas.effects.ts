import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ApiService } from 'src/app/services/api.service';
import * as AsignaturasActions from './asignaturas.actions';
import { catchError, map, mergeMap, of } from 'rxjs';

@Injectable()
export class AsignaturasEffects {
    constructor(
        private actions$: Actions,
        private apiService: ApiService
    ) { }

    cargarAsignaturas$ = createEffect(() => this.actions$.pipe(
        ofType(AsignaturasActions.cargarAsignaturas),
        mergeMap(() => this.apiService.getAsignaturas()
            .pipe(
                map(asignaturas => AsignaturasActions.cargarAsignaturasSuccess({ asignaturas })),
                catchError(error => of(AsignaturasActions.cargarAsignaturasFailure({ error })))
            ))
    )
    );
}
