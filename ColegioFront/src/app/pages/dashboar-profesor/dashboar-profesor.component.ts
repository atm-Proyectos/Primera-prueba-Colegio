import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Color, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-dashboar-profesor',
  templateUrl: './dashboar-profesor.component.html',
  styleUrls: ['./dashboar-profesor.component.css']
})
export class DashboarProfesorComponent implements OnInit {

  // Variables de datos (SOLO UNA VEZ)
  stats: any = null;
  cargando: boolean = true;
  nombreProfesor: string = '';

  // Variables específicas para los KPIs nuevos
  mejorAlumno: any = { nombre: 'N/A', valor: '-' };
  peorAlumno: any = { nombre: 'N/A', valor: '-' };
  alumnosEnRiesgo: any[] = [];
  ratioAprobados: any[] = [];
  alumnosPendientes: any[] = [];
  progresoCorreccion: any[] = [];

  // Configuración de Gráficas
  view: [number, number] = [undefined as any, 250];
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = false;
  showXAxisLabel = true;
  xAxisLabel = 'Asignaturas';
  showYAxisLabel = true;
  yAxisLabel = 'Alumnos';

  // Esquemas de Colores
  colorScheme: Color = {
    name: 'profesorScheme',
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
    name: 'ratioScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#2ecc71', '#e74c3c', '#95a5a6']
  };

  constructor(private api: ApiService) { }

  ngOnInit(): void {
    this.nombreProfesor = this.api.getUserName() || 'Profesor';
    this.cargarDatos();
  }

  cargarDatos() {
    this.api.getStatsProfesor().subscribe({
      next: (data: any) => {
        this.stats = data;
        // Sincronización con PascalCase del Backend ✨
        this.mejorAlumno = data.MejorAlumno || { Nombre: 'N/A', Valor: '-' };
        this.peorAlumno = data.PeorAlumno || { Nombre: 'N/A', Valor: '-' };
        this.alumnosEnRiesgo = data.AlumnosEnRiesgo || [];
        this.ratioAprobados = data.AprobadosVsSuspensos || [];
        this.alumnosPendientes = data.Pendientes || [];
        this.progresoCorreccion = data.ProgresoCorreccion || [];
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando dashboard:', err);
        this.cargando = false;
      }
    });
  }
}
