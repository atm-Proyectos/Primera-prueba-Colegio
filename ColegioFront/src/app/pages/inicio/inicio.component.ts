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
        this.resultados = data.map(item => ({
          alumnoNombre: item.alumno,       // El backend ya nos da el nombre completo
          asignaturaNombre: item.asignatura, // Y el nombre de la clase
          valor: item.valor
        }));
      },
      error: (err) => console.error("Error al cargar notas:", err)
    });
  }

  filtrar() {
    const texto = this.busqueda.toLowerCase();

    this.resultados = this.resultados.map(nota => {
      const alumno = this.alumnos.find(a => a.id === nota.alumnoId);
      const asig = this.asignaturas.find(a => a.id === nota.asignaturaId);

      return {
        ...nota,
        alumnoNombre: alumno ? `${alumno.nombre} ${alumno.apellido}` : "Desconocido",
        asignaturaNombre: asig ? asig.clase : "Desconocida"
      };
    }).filter(item => {
      return item.alumnoNombre.toLowerCase().includes(texto) || item.asignaturaNombre.toLowerCase().includes(texto);
    });

    this.resultados = this.resultados.sort((a, b) => {
      return a.alumnoNombre.localeCompare(b.alumnoNombre);
    })
  }
}