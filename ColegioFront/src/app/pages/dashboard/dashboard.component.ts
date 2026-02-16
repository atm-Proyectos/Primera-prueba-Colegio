import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { cargarStats } from 'src/app/state/Dashboard/dashboard.actions';
import { selectStats, selectLoading } from 'src/app/state/Dashboard/dashboard.selectors';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  stats$: Observable<any>;
  loading$: Observable<boolean>;

  // Configuración de Gráficas
  //view: [number, number] = [700, 300];
  colorScheme: any = {
    name: 'cool',
    selectable: true,
    group: 'Ordinal',
    domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5']
  };

  colorSchemeNotas: any = {
    name: 'notas',
    selectable: true,
    group: 'Ordinal',
    domain: ['#28a745', '#dc3545']
  };

  constructor(private store: Store) {
    this.loading$ = this.store.select(selectLoading);

    // Sanetizamos los datos antes de usarlos
    this.stats$ = this.store.select(selectStats).pipe(
      map(data => {
        if (!data) return null;

        // Aseguramos que ninguna lista sea NULL. Si es null, ponemos []
        return {
          ...data,
          alumnosPorAsignatura: this.validarGrafica(data.alumnosPorAsignatura),
          notaMediaPorAsignatura: this.validarGrafica(data.notaMediaPorAsignatura),
          distribucionEdades: this.validarGrafica(data.distribucionEdades),
          aprobadosVsSuspensos: this.validarGrafica(data.aprobadosVsSuspensos)
        };
      })
    );
  }

  ngOnInit(): void {
    this.store.dispatch(cargarStats());
  }

  // Función auxiliar para evitar que null rompa las gráficas
  validarGrafica(array: any[]) {
    if (!array || !Array.isArray(array)) return [];
    // Filtramos datos inválidos (donde name o value sean null)
    return array.filter(item => item && item.name != null && item.value != null);
  }
}