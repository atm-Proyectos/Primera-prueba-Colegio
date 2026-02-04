import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
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
  view: [number, number] = [700, 300];
  colorScheme: any = { domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5'] };
  colorSchemeNotas: any = { domain: ['#28a745', '#dc3545'] };

  constructor(private store: Store) {
    this.stats$ = this.store.select(selectStats);
    this.loading$ = this.store.select(selectLoading);
  }

  ngOnInit(): void {
    this.store.dispatch(cargarStats());
  }
}