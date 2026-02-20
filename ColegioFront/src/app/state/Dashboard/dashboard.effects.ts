import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ApiService } from 'src/app/services/api.service';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as DashboardActions from './dashboard.actions';

@Injectable()
export class DashboardEffects {

    cargarStats$ = createEffect(() => this.actions$.pipe(
        ofType(DashboardActions.cargarStats),
        mergeMap(() => this.api.getStats()
            .pipe(
                map(data => {
                    return DashboardActions.cargarStatsSuccess({ stats: data });
                }),
                catchError(error => {
                    console.error("Error en Effect Dashboard:", error);
                    return of(DashboardActions.cargarStatsFailure({ error }))
                })
            ))
    ));

    constructor(
        private actions$: Actions,
        private api: ApiService
    ) { }
}