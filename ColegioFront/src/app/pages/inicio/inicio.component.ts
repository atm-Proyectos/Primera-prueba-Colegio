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

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.cargarTodo();   
  }

  cargarTodo() {
    forkJoin({
      alumnos: this.api.getAlumnos(),
      asignaturas: this.api.getAsignaturas(),
      notas: this.api.getNotas()
    }).subscribe({
      next: (res) => {
        this.alumnos = res.alumnos;
        this.asignaturas = res.asignaturas;
        this.resultados = res.notas;

        this.filtrar();
      },
      error: (err) => console.error("Error al cargar los datos", err)
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