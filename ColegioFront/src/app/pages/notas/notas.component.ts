import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Store } from '@ngrx/store';
import { Notas } from 'src/app/models/notas.models';
import { cargarNotas } from 'src/app/state/Notas/notas.actions';
import { Observable } from 'rxjs';
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
    private api: ApiService,
    private store: Store<{ notas: any }>) {
    this.notas$ = this.store.select(state => state.notas.notas);
    this.cargando$ = this.store.select(state => state.notas.cargando);
    this.error$ = this.store.select(state => state.notas.error);
  }

  ngOnInit(): void {
    this.store.dispatch(cargarNotas());
    this.cargarAuxiliares();
  }

  cargarAuxiliares() {
    this.api.getAlumnos().subscribe(res => this.listaAlumnos = res);
    this.api.getMatriculas().subscribe(res => this.listaMatriculas = res);
  }

  alCambiarAlumno() {
    this.formSeleccion.asignaturaId = null;
    const alumnoId = this.formSeleccion.alumnoId;
    if (alumnoId) {
      const matriculas = this.listaMatriculas.filter(m => m.alumnoId == alumnoId);
      this.listaAsignaturasDelAlumno = matriculas.map(m => m.asignatura);
    } else {
      this.listaAsignaturasDelAlumno = [];
    }
  }

  guardar() {
    // Validaciones con SweetAlert
    if (!this.valorNota || !this.formSeleccion.alumnoId || !this.formSeleccion.asignaturaId) {
      Swal.fire('Faltan datos', 'Selecciona alumno, asignatura y escribe una nota.', 'warning');
      return;
    }

    if (this.valorNota < 0 || this.valorNota > 10) {
      Swal.fire('Nota inválida', 'La nota debe estar entre 0 y 10.', 'error');
      return;
    }

    const objetoNota = {
      id: this.notaIdEditar,
      valor: this.valorNota,
      alumnoId: this.formSeleccion.alumnoId,
      asignaturaId: this.formSeleccion.asignaturaId
    };

    const request = this.notaIdEditar === 0
      ? this.api.guardarNota(objetoNota)
      : this.api.editarNota(this.notaIdEditar, objetoNota);

    request.subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: '¡Nota Guardada!',
          showConfirmButton: false,
          timer: 1500
        });
        this.store.dispatch(cargarNotas());
        this.limpiar();
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'No se pudo guardar la nota.', 'error');
      }
    });
  }

  editar(nota: any) {
    this.notaIdEditar = nota.id;
    this.valorNota = nota.valor;
    this.formSeleccion.alumnoId = nota.alumnoId;

    // Cargamos las asignaturas posibles de este alumno
    this.alCambiarAlumno();

    // Aviso informativo suave en vez de alert()
    Swal.fire({
      icon: 'info',
      title: 'Modo Edición',
      text: 'Confirma la asignatura antes de guardar.',
      timer: 2500,
      showConfirmButton: false
    });

    // Pequeño retardo para que el select se actualice
    setTimeout(() => {
      this.formSeleccion.asignaturaId = nota.asignaturaId;
    }, 100);
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

  evitarSimbolos(event: any) {
    if (['-', '+', 'e', 'E'].includes(event.key)) {
      event.preventDefault();
      this.mostrarAvisoSimbolos = true;
      setTimeout(() => this.mostrarAvisoSimbolos = false, 2000);
    }
  }
}