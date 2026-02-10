import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Store } from '@ngrx/store';
import { Notas } from 'src/app/models/notas.models';
import { cargarNotas } from 'src/app/state/Notas/notas.actions';
import { forkJoin, Observable } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-notas',
  templateUrl: './notas.component.html',
  styleUrls: ['./notas.component.css']
})
export class NotasComponent implements OnInit {
  notas$: Observable<Notas[]>;
  cargando$: Observable<boolean>;
  error$: Observable<any>;

  listaNotas: any[] = [];
  listaAlumnos: any[] = [];
  listaMatriculas: any[] = [];

  listaAsignaturasDelAlumno: any[] = [];

  mensajeError: string = "";
  cargando: boolean = true;
  mostrarAvisoSimbolos: boolean = false;

  formSeleccion: any = { alumnoId: null, asignaturaId: null };
  valorNota: number | null = null;
  notaIdEditar: number = 0;

  constructor(
    public api: ApiService,
    private store: Store<{ notas: any }>) {
    this.notas$ = this.store.select(state => state.notas.notas);
    this.cargando$ = this.store.select(state => state.notas.cargando);
    this.error$ = this.store.select(state => state.notas.error);
  }

  ngOnInit(): void {
    this.store.dispatch(cargarNotas());

    forkJoin([
      this.api.getAlumnos(),
      this.api.getMatriculas()
    ]).subscribe({
      next: (results) => {
        this.listaAlumnos = results[0];
        this.listaMatriculas = results[1];
        this.cargando = false;
      },
      error: (err) => {
        console.error("Error cargando datos iniciales", err);
        this.cargando = false;
      }
    });
  }

  alCambiarAlumno() {
    // Limpiamos la asignatura seleccionada anterior para evitar errores
    this.formSeleccion.asignaturaId = null;

    // Filtramos las matrículas: Buscamos aquellas donde el alumnoId coincida
    // Usamos '==' para evitar problemas si uno es string y otro number
    this.listaAsignaturasDelAlumno = this.listaMatriculas
      .filter(m => m.alumnoId == this.formSeleccion.alumnoId);

    // Si no hay asignaturas, avisamos (opcional, mantenemos tu estilo de alertas)
    if (this.listaAsignaturasDelAlumno.length === 0 && this.formSeleccion.alumnoId) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin asignaturas',
        text: 'Este alumno no está matriculado en ninguna clase.',
        timer: 3000
      });
    }
  }

  guardar() {
    this.mensajeError = "";

    // VALIDACIÓN 1: Buscar la matrícula correcta (El cruce entre Alumno y Asignatura)
    // El backend necesita el ID de la tabla intermedia (AsignaturaAlumnoId), no los sueltos.
    const matriculaEncontrada = this.listaMatriculas.find(m =>
      m.alumnoId == this.formSeleccion.alumnoId &&
      m.asignaturaId == this.formSeleccion.asignaturaId
    );

    if (!matriculaEncontrada) {
      Swal.fire('Error', 'No se encontró la matrícula válida para este alumno y asignatura.', 'error');
      return;
    }

    if (this.valorNota === null || this.valorNota < 0 || this.valorNota > 10) {
      this.mensajeError = "La nota debe estar entre 0 y 10";
      return;
    }

    // Preparamos el objeto tal cual lo pide el Backend (ModelNotas.cs)
    const nuevaNota: Notas = {
      id: this.notaIdEditar,
      valor: this.valorNota!,
      nombreAlumno: "", // No necesario para enviar
      nombreAsignatura: "", // No necesario para enviar
      asignaturaAlumnoId: matriculaEncontrada.id // <--- AQUÍ ESTÁ LA CLAVE (ID de la matrícula)
    };

    if (this.notaIdEditar === 0) {
      this.api.guardarNota(nuevaNota).subscribe({
        next: () => {
          Swal.fire('Guardado', 'Nota registrada correctamente', 'success');
          this.store.dispatch(cargarNotas());
          this.limpiar();
        },
        error: (err) => Swal.fire('Error', 'No se pudo guardar la nota', 'error')
      });
    } else {
      this.api.editarNota(this.notaIdEditar, nuevaNota).subscribe({
        next: () => {
          Swal.fire('Actualizado', 'Nota modificada correctamente', 'success');
          this.store.dispatch(cargarNotas());
          this.limpiar();
        },
        error: (err) => Swal.fire('Error', 'No se pudo actualizar', 'error')
      });
    }
  }

  editar(nota: any) {
    this.notaIdEditar = nota.id;
    this.valorNota = nota.valor;

    // Nota: Para editar correctamente los selectores, necesitaríamos saber el ID del alumno
    // que viene en la nota. Si tu backend no devuelve alumnoId en el GET de notas,
    // los selectores podrían no marcarse solos. Pero el guardado funcionará.

    // Intentamos preseleccionar si tenemos los datos (depende de tu API de notas)
    if (nota.asignaturaAlumno && nota.asignaturaAlumno.alumnoId) {
      this.formSeleccion.alumnoId = nota.asignaturaAlumno.alumnoId;
      this.alCambiarAlumno(); // Cargamos asignaturas

      setTimeout(() => {
        // Buscamos la asignatura dentro de la matricula
        if (nota.asignaturaAlumno) {
          this.formSeleccion.asignaturaId = nota.asignaturaAlumno.asignaturaId;
        }
      }, 100);
    }

    Swal.fire({
      icon: 'info',
      title: 'Modo Edición',
      text: 'Modifica el valor y guarda.',
      timer: 2000,
      showConfirmButton: false
    });
  }

  limpiar() {
    this.notaIdEditar = 0;
    this.valorNota = null;
    this.formSeleccion = { alumnoId: null, asignaturaId: null };
    this.listaAsignaturasDelAlumno = [];
    this.mensajeError = "";
  }

  eliminar(id: number) {
    Swal.fire({
      title: '¿Borrar nota?',
      text: "Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.api.eliminarNota(id).subscribe({
          next: () => {
            Swal.fire('Borrada', 'Nota eliminada.', 'success');
            this.store.dispatch(cargarNotas());
          },
          error: (err) => Swal.fire('Error', 'No se pudo borrar la nota.', 'error')
        });
      }
    });
  }
}