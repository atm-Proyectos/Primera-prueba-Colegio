import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Color, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-perfil-alumno',
  templateUrl: './perfil-alumno.component.html',
  styleUrls: ['./perfil-alumno.component.css']
})
export class PerfilAlumnoComponent implements OnInit {
  // Datos del alumno
  stats: any = null;
  cargando: boolean = true;
  nombreUsuario: string = '';

  // Configuración de la Gráfica
  view: [number, number] = [700, 400];
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Asignaturas';
  showYAxisLabel = true;
  yAxisLabel = 'Nota (0-10)';

  colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

  constructor(private api: ApiService) { }

  ngOnInit(): void {
    this.nombreUsuario = this.api.getUserName() || 'Usuario';
    this.cargarDatos();
  }

  cargarDatos() {
    this.api.getStatsAlumno().subscribe({
      next: (data) => {
        this.stats = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error("Error cargando perfil", err);
        this.cargando = false;
      }
    });
  }
}