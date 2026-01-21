import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Alumnos } from 'src/app/models/alumnos.model';
import { cargarAlumnos } from 'src/app/state/Alumnos/alumnos.actions';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-alumnos',
  templateUrl: './alumnos.component.html',
  styleUrls: ['./alumnos.component.css']
})
export class AlumnosComponent implements OnInit {

  alumnos$: Observable<Alumnos[]>;
  cargando$: Observable<boolean>;
  error$: Observable<any>;

  mensajeError: string = "";

  formAlumno: Alumnos = {
    id: 0,
    nombre: "",
    apellido: "",
    edad: 0
  };

  modoMatricula: boolean = false;
  alumnoSeleccionado: any = null;
  listaAsignaturas: any[] = [];
  listaMatriculas: any[] = [];
  matriculasAlumno: any[] = [];
  asignaturaParaMatricular: any = null;

  constructor(
    private store: Store<{ alumnos: any }>,
    private api: ApiService
  ) {
    this.alumnos$ = this.store.select(state => state.alumnos.alumnos);
    this.cargando$ = this.store.select(state => state.alumnos.loading);
    this.error$ = this.store.select(state => state.alumnos.error);
  }

  ngOnInit(): void {
    this.store.dispatch(cargarAlumnos());
    this.cargarDatosAuxiliares();
  }

  cargarDatosAuxiliares() {
    this.api.getAsignaturas().subscribe(data => this.listaAsignaturas = data);
    this.api.getMatriculas().subscribe(data => this.listaMatriculas = data);
  }

  // --- MÉTODOS DE ACCIÓN ---

  guardar() {
    this.mensajeError = "";

    const peticion = this.formAlumno.id === 0
      ? this.api.guardarAlumno(this.formAlumno)
      : this.api.editarAlumno(this.formAlumno.id, this.formAlumno);

    peticion.subscribe({
      next: () => {
        this.store.dispatch(cargarAlumnos());
        this.limpiar();
      },
      error: (err) => this.manejarError(err)
    });
  }

  eliminar(id: number) {
    if (confirm("¿Seguro que quieres borrar este alumno?")) {
      this.api.eliminarAlumno(id).subscribe({
        next: () => this.store.dispatch(cargarAlumnos()),
        error: (err) => this.manejarError(err)
      });
    }
  }

  editar(alumno: any) {
    this.formAlumno = { ...alumno };
  }

  limpiar() {
    this.formAlumno = { id: 0, nombre: "", apellido: "", edad: 0 };
    this.mensajeError = "";
  }

  manejarError(err: any) {
    console.error(err);
    this.mensajeError = "🛑 Ocurrió un error (Revisa consola)";
    if (err.error && typeof err.error === 'string') this.mensajeError = "🛑 " + err.error;
    setTimeout(() => this.mensajeError = "", 5000);
  }

  // --- LÓGICA DEL MODAL DE MATRÍCULAS ---

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
        // Refrescamos matrículas
        this.api.getMatriculas().subscribe(data => {
          this.listaMatriculas = data;
          this.filtrarMatriculas();
        });
        this.asignaturaParaMatricular = null;
      },
      error: (err) => alert("🛑 Error al matricular")
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