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
        // Sincronización con PascalCase del Backend
        this.asignaturas = data.Asignaturas || [];
        this.ratioAprobados = data.StatsTarta || [];
        this.cargando = false;
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar el dashboard',
          confirmButtonText: 'Aceptar'
        })
        this.cargando = false;
      }
<<<<<<< Updated upstream
=======

    });
  }

  descargarPDF() {
    // Al usar HttpClient, tu interceptor añadirá el Token automáticamente
    this.http.get(`http://localhost:5141/api/Notas/exportar-pdf`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Boletin_${this.nombreUsuario}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        Swal.fire({
          icon: 'success',
          title: 'PDF descargado correctamente',
          text: 'El PDF se ha descargado correctamente',
          confirmButtonText: 'Aceptar'
        });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error al descargar el PDF',
          text: 'Por favor, intenta nuevamente',
          confirmButtonText: 'Aceptar'
        });
      }
>>>>>>> Stashed changes
    });
  }
}