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

  // Variables específicas para los KPIs
  promedioGeneral: number = 0;
  totalAsignaturas: number = 0;
  ratioAprobados: any[] = [];
  aprobadas: number = 0;
  suspensas: number = 0;
  asignaturas: any[] = [];

  // Configuración de la Gráfica
  view: [number, number] = [undefined as any, 250];
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Asignaturas';
  showYAxisLabel = true;
  yAxisLabel = 'Nota (0-10)';

  // Esquemas de Colores
  colorScheme: Color = {
    name: 'alumnoScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#ff9f43', '#ee5253', '#0abde3', '#10ac84']
  };

  colorSchemeTarta: Color = {
    name: 'tartaScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#66bb6a', '#e0e0e0']
  };

  colorSchemeRatio: Color = {
    name: 'card-dashboard',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#2ecc71', '#e74c3c', '#95a5a6']
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
        // Aquí asignamos la lista que viene del C#
        this.asignaturas = data.asignaturas;
        // Y los datos para la tarta
        this.ratioAprobados = data.statsTarta;
        this.cargando = false;
      },
      error: (err) => {
        console.error("Error al cargar dashboard", err);
        this.cargando = false;
      }
    });
  }
}