import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Alumnos } from 'src/app/models/alumnos.model';
import { ApiService } from 'src/app/services/api.service';
import Swal from 'sweetalert2';

import { cargarAlumnos } from 'src/app/state/Alumnos/alumnos.actions';

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
    public api: ApiService
  ) {
    this.alumnos$ = this.store.select(state => state.alumnos.alumnos);
    this.cargando$ = this.store.select(state => state.alumnos.loading);
    this.error$ = this.store.select(state => state.alumnos.error);
  }

  ngOnInit(): void {
    // 1. Suscribirse a los datos del Store
    this.alumnos$ = this.store.select(state => state.alumnos.alumnos);
    this.cargando$ = this.store.select(state => state.alumnos.loading);
    this.error$ = this.store.select(state => state.alumnos.error);

    // 2. IMPORTANTE: Pedir que se carguen los alumnos al iniciar 👇
    this.store.dispatch(cargarAlumnos());
  }

  cargarAlumnos() {
    this.store.dispatch(cargarAlumnos());
  }

  guardar() {
    if (!this.formAlumno.nombre || !this.formAlumno.apellido || this.formAlumno.edad <= 0) {
      Swal.fire('Error', 'Rellena todos los campos correctamente', 'error');
      return;
    }

    const peticion = this.formAlumno.id === 0
      ? this.api.guardarAlumno(this.formAlumno)
      : this.api.editarAlumno(this.formAlumno.id, this.formAlumno);

    peticion.subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: this.formAlumno.id === 0 ? '¡Registrado!' : '¡Actualizado!',
          text: 'Los datos se han guardado correctamente.',
          timer: 2000,
          showConfirmButton: false
        });

        // Recargamos los datos del Store para que se actualice la tabla
        this.store.dispatch(cargarAlumnos());

        this.limpiar();
      },
      error: (err) => this.manejarError(err)
    });
  }

  editar(alumno: any) {
    this.formAlumno = { ...alumno };
  }

  eliminar(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Se borrará el alumno y todas sus notas.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.api.eliminarAlumno(id).subscribe({
          next: () => {
            Swal.fire('Borrado', 'El alumno ha sido eliminado.', 'success');
            // Recargamos los datos del Store
            this.store.dispatch(cargarAlumnos());
          },
          error: (err) => Swal.fire('Error', 'No se pudo eliminar el alumno', 'error')
        });
      }
    });
  }

  limpiar() {
    this.formAlumno = {
      id: 0,
      nombre: "",
      apellido: "",
      edad: 0
    }
  }

  manejarError(err: any) {
    console.error(err);
    let msg = "🛑 Ocurrió un error";
    if (err.error && typeof err.error === 'string') msg = "🛑 " + err.error;
    Swal.fire('Error', msg, 'error');
  }

  // --- LÓGICA DEL MODAL DE MATRÍCULAS ---

  abrirMatriculas(alumno: any) {
    this.alumnoSeleccionado = alumno;
    this.modoMatricula = true;

    this.api.getAsignaturas().subscribe(data => {
      this.listaAsignaturas = data;
    });

    this.api.getMatriculas().subscribe(data => {
      this.listaMatriculas = data;
      this.filtrarMatriculas();
    });
  }

  filtrarMatriculas() {
    if (this.alumnoSeleccionado) {
      this.matriculasAlumno = this.listaMatriculas.filter(m => m.alumnoId === this.alumnoSeleccionado.id);
    }
  }

  matricular() {
    if (!this.asignaturaParaMatricular) return;

    this.api.matricular(this.alumnoSeleccionado.id, this.asignaturaParaMatricular).subscribe({
      next: () => {
        // ✅ 1. ÉXITO: Mostramos un mensaje temporal (Toast)
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          }
        });

        Toast.fire({
          icon: 'success',
          title: 'Matrícula realizada correctamente'
        });

        // ✅ 2. Recargamos la lista para que aparezca la nueva asignatura
        this.api.getMatriculas().subscribe(data => {
          this.listaMatriculas = data;
          this.filtrarMatriculas();
        });

        // ✅ 3. Reseteamos el select para que vuelva a "Elegir Asignatura"
        this.asignaturaParaMatricular = null;
      },
      error: (err) => {
        const mensajeError = err.error || "No se pudo realizar la matrícula.";

        Swal.fire({
          icon: 'warning',
          title: 'No se pudo matricular',
          text: mensajeError,
          confirmButtonColor: '#3085d6',
        });
      }
    });
  }

  eliminarMatricula(id: number) {
    Swal.fire({
      title: '¿Quitar asignatura?',
      text: "Se perderán las notas asociadas si las hay.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, quitar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.api.eliminarMatricula(id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'Matrícula anulada', 'success');
            this.api.getMatriculas().subscribe(data => {
              this.listaMatriculas = data;
              this.filtrarMatriculas();
            });
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar', 'error')
        });
      }
    });
  }

  cerrarMatriculas() {
    this.modoMatricula = false;
    this.alumnoSeleccionado = null;
    this.asignaturaParaMatricular = null;
  }
}