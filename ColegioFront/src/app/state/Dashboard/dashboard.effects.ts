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
                    const statsFormat = {
                        totalAlumnos: data.totalAlumnos,
                        totalAsignaturas: data.totalAsignaturas,
                        edadMediaGlobal: data.edadMediaGlobal,
                        // Usamos 'nombre' y 'valor' que es lo que viene del C# ahora
                        alumnosPorAsignatura: (data.alumnosPorAsignatura || []).map((d: any) => ({
                            name: d.nombre,
                            value: d.valor
                        })),
                        distribucionEdades: (data.distribucionEdades || []).map((d: any) => ({
                            name: d.nombre,
                            value: d.valor
                        })),
                        aprobadosVsSuspensos: (data.aprobadosVsSuspensos || []).map((d: any) => ({
                            name: d.nombre,
                            value: d.valor
                        })),
                        notaMediaPorAsignatura: (data.notaMediaPorAsignatura || []).map((d: any) => ({
                            name: d.nombre,
                            value: d.valor,
                            valorDecimal: d.valorDecimal
                        }))
                    };
                    return DashboardActions.cargarStatsSuccess({ stats: statsFormat });
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