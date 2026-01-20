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
    this.mensajeError = "";

    const peticion = this.formAlumno.id === 0
      ? this.api.guardarAlumno(this.formAlumno)
      : this.api.editarAlumno(this.formAlumno.id, this.formAlumno);

    peticion.subscribe({
      next: () => {
        this.cargarAlumnos();
        this.limpiar();
        this.mensajeError = "";
      },
      error: (err) => {
        console.error(err);
        this.mensajeError = "🛑 " + (err.error?.title || err.error || err.message || "Error desconocido al guardar.");
        setTimeout(() => this.mensajeError = "", 5000);
      }
    });
  }

  manejarError(err: any) {
    console.log("Error recibido:", err);

    if (typeof err.error === 'string') {
      this.mensajeError = "🛑 " + err.error;
    }
    else if (err.error?.errors) {
      const primeraClave = Object.keys(err.error.errors)[0];
      this.mensajeError = "⚠️ " + err.error.errors[primeraClave][0];
    }
    else {
      this.mensajeError = "🛑 Error de conexión o servidor.";
    }

    setTimeout(() => this.mensajeError = "", 5000);
  }

  editar(alumno: any) {
    this.formAlumno = { ...alumno };
  }

  eliminar(id: number) {
    if (confirm("¿Seguro que quieres borrar este alumno?")) {
      this.api.eliminarAlumno(id).subscribe({
        next: () => {
          this.cargarAlumnos();
          this.mensajeError = "";
        },
        error: (err) => {
          console.error(err);
          this.mensajeError = this.traducirError(err);
          setTimeout(() => this.mensajeError = "", 5000);
        }
      });
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
    if (this.alumnoSeleccionado) {
      this.matriculasAlumno = this.listaMatriculas.filter(m => m.alumnoId === this.alumnoSeleccionado.id);
    }
  }

  matricular() {
    if (!this.asignaturaParaMatricular || !this.alumnoSeleccionado) return;

    this.api.matricular(this.alumnoSeleccionado.id, this.asignaturaParaMatricular).subscribe({
      next: () => {
        this.api.getMatriculas().subscribe(data => {
          this.listaMatriculas = data;
          this.filtrarMatriculas();
        });
        this.asignaturaParaMatricular = null;
      },
      error: (err) => alert("🛑 " + (err.error || "Error al matricular"))
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


  private traducirError(err: any): string {
    let mensaje = err.error?.title || err.error || err.message || "Error desconocido";

    if (mensaje.includes("Foreign key") || mensaje.includes("constraint")) {
      return "🛑 No se puede borrar: El alumno tiene notas o matrículas asociadas.";
    }
    if (mensaje.includes("connection refused") || err.status === 0) {
      return "🛑 Error de conexión: El servidor parece apagado.";
    }
    if (err.status === 400) {
      return "🛑 Datos incorrectos. Revisa los campos.";
    }
    if (err.status === 404) {
      return "🛑 El recurso no existe (quizás ya fue borrado).";
    }
    if (err.status === 500) {
      return "🛑 Error interno del servidor. Inténtalo luego.";
    }

    return "🛑 " + mensaje;
  }
}