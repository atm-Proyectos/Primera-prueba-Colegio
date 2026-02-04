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
                // OJO: Aquí mapeamos los datos para las gráficas si vienen crudos de la API
                map(data => {
                    // Adaptación de datos para ngx-charts
                    const statsFormat = {
                        totalAlumnos: data.totalAlumnos,
                        totalAsignaturas: data.totalAsignaturas,
                        edadMediaGlobal: data.edadMediaGlobal,
                        alumnosPorAsignatura: data.alumnosPorAsignatura.map((d: any) => ({ name: d.nombre, value: d.valor })),
                        distribucionEdades: data.distribucionEdades.map((d: any) => ({ name: d.nombre, value: d.valor })),
                        notaMediaPorAsignatura: data.notaMediaPorAsignatura.map((d: any) => ({ name: d.nombre, value: d.valorDecimal })), // Ajusta si tu API devuelve otro nombre
                        aprobadosVsSuspensos: data.aprobadosVsSuspensos.map((d: any) => ({ name: d.nombre, value: d.valor }))
                    };
                    return DashboardActions.cargarStatsSuccess({ stats: statsFormat });
                }),
                catchError(error => of(DashboardActions.cargarStatsFailure({ error })))
            ))
    ));

    constructor(
        private actions$: Actions,
        private api: ApiService
    ) { }
}