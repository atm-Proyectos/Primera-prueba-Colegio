import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ApiService } from 'src/app/services/api.service';
import * as AlumnosActions from './alumnos.actions';
import { catchError, map, mergeMap, of } from 'rxjs';

@Injectable()
export class AlumnosEffects {

    constructor(
        private actions$: Actions,
        private apiService: ApiService
    ) { }

    cargarAlumnos$ = createEffect(() => this.actions$.pipe(
        ofType(AlumnosActions.cargarAlumnos),
        mergeMap(() => this.apiService.getAlumnos()
            .pipe(
                map(alumnos => AlumnosActions.cargarAlumnosSuccess({ alumnos })),
                catchError(error => of(AlumnosActions.cargarAlumnosFailure({ error })))
            ))
    )
    );
}