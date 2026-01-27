import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  stats: any = null;

  // Opciones de vista
  view: [number, number] = [700, 300];

  // Esquema de colores
  colorScheme: any = {
    domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5']
  };

  colorSchemeNotas: any = {
    domain: ['#28a745', '#dc3545']
  };

  constructor(private api: ApiService) { }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    this.api.getStats().subscribe({
      next: (data) => {
        console.log('Datos recibidos:', data);

        // Mapeamos los datos para que las gráficas entiendan 'name' y 'value'
        this.stats = {
          totalAlumnos: data.totalAlumnos,
          totalAsignaturas: data.totalAsignaturas,
          edadMediaGlobal: data.edadMediaGlobal,

          alumnosPorAsignatura: data.alumnosPorAsignatura.map((d: any) => ({
            name: d.nombre,
            value: d.valor
          })),

          distribucionEdades: data.distribucionEdades.map((d: any) => ({
            name: d.nombre,
            value: d.valor
          })),

          notaMediaPorAsignatura: data.notaMediaPorAsignatura.map((d: any) => ({
            name: d.nombre,
            value: d.valorDecimal
          })),

          aprobadosVsSuspensos: data.aprobadosVsSuspensos.map((d: any) => ({
            name: d.nombre,
            value: d.valor
          }))
        };
      },
      error: (err) => console.error('Error cargando stats:', err)
    });
  }
}