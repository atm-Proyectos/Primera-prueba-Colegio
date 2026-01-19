import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-alumnos',
  templateUrl: './alumnos.component.html',
  styleUrls: ['./alumnos.component.css']
})
export class AlumnosComponent implements OnInit {
  listaAlumnos: any[] = [];
  formAlumno: any = { id: 0, nombre: "", apellido: "", edad: null };
  mensajeError: string = "";
  cargando: boolean = true;

  // Variables para gestión de matrículas
  modoMatricula: boolean = false;
  alumnoSeleccionado: any = null;
  listaMatriculas: any[] = [];
  matriculasAlumno: any[] = [];
  listaAsignaturas: any[] = [];
  asignaturaParaMatricular: any = null;

  constructor(private api: ApiService) { }

  ngOnInit(): void {
    this.cargarAlumnos();
    // Cargamos asignaturas y matriculas para tenerlas listas
    this.api.getAsignaturas().subscribe(data => this.listaAsignaturas = data);
    this.cargarMatriculas();
  }

  cargarMatriculas() {
    this.api.getMatriculas().subscribe(data => this.listaMatriculas = data);
  }

  cargarAlumnos() {
    this.cargando = true;
    this.api.getAlumnos().subscribe({
      next: (data) => { this.listaAlumnos = data; this.cargando = false; },
      error: (err) => { console.error(err); this.cargando = false; }
    });
  }

  guardar() {
    if (this.formAlumno.id === 0) {
      this.api.guardarAlumno(this.formAlumno).subscribe(() => {
        this.cargarAlumnos();
        this.limpiar();
      });
    } else {
      this.api.editarAlumno(this.formAlumno.id, this.formAlumno).subscribe(() => {
        this.cargarAlumnos();
        this.limpiar();
      });
    }
  }

  editar(alumno: any) {
    this.formAlumno = { ...alumno };
  }

  eliminar(id: number) {
    if (confirm("¿Seguro que quieres borrar este alumno?")) {
      this.api.desmatricular(id).subscribe(() => this.cargarAlumnos());
    }
  }

  limpiar() {
    this.formAlumno = { id: 0, nombre: "", apellido: "", edad: null };
  }

  // --- LÓGICA DEL POPUP DE MATRÍCULA ---

  abrirMatriculas(alumno: any) {
    this.alumnoSeleccionado = alumno;
    this.modoMatricula = true;
    this.filtrarMatriculas();
  }

  filtrarMatriculas() {
    // Buscamos en todas las matrículas las que sean de este alumno
    if (this.alumnoSeleccionado) {
      this.matriculasAlumno = this.listaMatriculas.filter(m => m.alumnoId === this.alumnoSeleccionado.id);
    }
  }

  matricular() {
    if (!this.asignaturaParaMatricular || !this.alumnoSeleccionado) return;

    this.api.matricular(this.alumnoSeleccionado.id, this.asignaturaParaMatricular).subscribe({
      next: () => {
        // Recargamos la lista global de matrículas
        this.api.getMatriculas().subscribe(data => {
          this.listaMatriculas = data;
          this.filtrarMatriculas();
        });
        this.asignaturaParaMatricular = null;
      },
      error: (err) => alert("El alumno ya está matriculado en esa asignatura.")
    });
  }

  eliminarMatricula(id: number) {
    if (confirm("¿Quitar asignatura al alumno?")) {
      this.api.desmatricular(id).subscribe(() => {
        this.api.getMatriculas().subscribe(data => {
          this.listaMatriculas = data;
          this.filtrarMatriculas();
        });
      });
    }
  }

  cerrarMatriculas() {
    this.modoMatricula = false;
    this.alumnoSeleccionado = null;
  }
}