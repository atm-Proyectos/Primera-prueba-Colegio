import { Component, OnInit } from "@angular/core";
import { ApiService } from "src/app/services/api.service";
import { forkJoin } from "rxjs";


@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {
  alumnos: any[] = [];
  asignaturas: any[] = [];
  resultados: any[] = [];
  busqueda: string = "";

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.api.buscarNotas(this.busqueda).subscribe({
      next: (data) => {
        // Mapeamos los datos para que coincidan con tu HTML actual
        this.resultados = data.map((item: any) => ({
          alumnoNombre: item.NombreAlumno,       // El backend ya nos da el nombre completo
          asignaturaNombre: item.NombreAsignatura, // Y el nombre de la clase
          valor: item.Valor
        }));
      },
      error: (err) => console.error("Error al cargar notas:", err)
    });
  }

  filtrar() {
    const texto = this.busqueda.toLowerCase();

    this.resultados = this.resultados.map((nota: any) => {
      const alumno = this.alumnos.find(a => a.NombreAlumno === nota.NombreAlumno);
      const asig = this.asignaturas.find(a => a.NombreAsignatura === nota.NombreAsignatura);

      return {
        ...nota,
        alumnoNombre: alumno ? `${alumno.NombreAlumno} ${alumno.ApellidoAlumno}` : "Desconocido",
        asignaturaNombre: asig ? asig.NombreAsignatura : "Desconocida"
      };
    }).filter(item => {
      return item.alumnoNombre.toLowerCase().includes(texto) || item.asignaturaNombre.toLowerCase().includes(texto);
    });

    this.resultados = this.resultados.sort((a: any, b: any) => {
      return a.alumnoNombre.localeCompare(b.alumnoNombre);
    })
  }
}