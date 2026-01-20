import { Component, OnInit } from '@angular/core';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  listaAlumnos: any[] = []; // Aquí guardaremos los datos

  constructor(private api: ApiService) { }

  // Esto se ejecuta nada más abrir la web
  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.api.getAlumnos().subscribe({
      next: (datos) => {
        this.listaAlumnos = datos;
        console.log("Datos cargados:", datos);
      },
      error: (e) => console.error("Error conectando:", e)
    });
  }

  borrar(id: number) {
    if (confirm('¿Seguro que quieres borrar a este alumno?')) {
      this.api.eliminarAlumno(id).subscribe(() => {
        this.cargarDatos(); // Recargar la tabla tras borrar
      });
    }
  }
}