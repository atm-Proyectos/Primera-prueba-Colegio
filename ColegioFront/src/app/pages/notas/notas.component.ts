import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Store } from '@ngrx/store';
import { Notas } from 'src/app/models/notas.models';
import { cargarNotas } from 'src/app/state/Notas/notas.actions';
import { Observable } from 'rxjs';

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
    this.cargarDatosAuxiliares();
  }

  cargarDatosAuxiliares() {
    this.api.getNotas().subscribe(notas => this.listaNotas = notas);
    this.api.getAlumnos().subscribe(alumnos => this.listaAlumnos = alumnos);
    this.api.getMatriculas().subscribe(matriculas => this.listaMatriculas = matriculas);
  }

  cargarDatosIniciales() {
    this.cargando = true;
    this.api.getNotas().subscribe(notas => {
      this.listaNotas = notas;
      this.api.getAlumnos().subscribe(alumnos => {
        this.listaAlumnos = alumnos;
        this.api.getMatriculas().subscribe(matriculas => {
          this.listaMatriculas = matriculas;
          this.cargando = false;
        });
      });
    });
  }

  alCambiarAlumno() {
    this.formSeleccion.asignaturaId = null;
    this.listaAsignaturasDelAlumno = [];

    if (this.formSeleccion.alumnoId) {
      const matriculas = this.listaMatriculas.filter(m => m.alumnoId == this.formSeleccion.alumnoId);

      this.listaAsignaturasDelAlumno = matriculas.map(m => ({
        idAsignaturaReal: m.asignaturaId,
        idMatricula: m.id,
        nombreAsignatura: m.asignatura
      }));

      if (this.listaAsignaturasDelAlumno.length === 0) {
        alert("Este alumno no está matriculado en ninguna asignatura. Ve a 'Alumnos' y matricúlalo primero.");
      }
    }
  }

  guardar() {
    this.mensajeError = "";

    // 1. BUSCAR EL ID DE LA MATRÍCULA
    const matriculaEncontrada = this.listaMatriculas.find(m =>
      m.alumnoId == this.formSeleccion.alumnoId &&
      m.asignaturaId == this.formSeleccion.asignaturaId
    );

    if (!matriculaEncontrada) {
      this.mensajeError = "🛑 Error: No se encuentra la matrícula. Asegúrate de que el alumno está matriculado.";
      return;
    }

    // 2. Preparar el objeto para el Backend
    const notaParaEnviar = {
      id: this.notaIdEditar,
      valor: this.valorNota,
      asignaturaAlumnoId: matriculaEncontrada.id
    };

    // 3. Enviar
    const peticion = this.notaIdEditar === 0
      ? this.api.guardarNota(notaParaEnviar)
      : this.api.editarNota(this.notaIdEditar, notaParaEnviar);

    peticion.subscribe({
      next: () => {
        // ÉXITO: Recargamos tabla (Redux) y limpiamos
        this.store.dispatch(cargarNotas());
        this.limpiar();
      },
      error: (err) => {
        console.error(err);
        this.mensajeError = "🛑 Error al guardar.";
      }
    });
  }

  editar(nota: any) {
    this.notaIdEditar = nota.id;
    this.valorNota = nota.valor;
    this.formSeleccion.alumnoId = nota.alumnoId;
    this.alCambiarAlumno();

    alert("⚠️ Modo Edición: Por seguridad, selecciona de nuevo el Alumno y Asignatura.");

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
    if (confirm("¿Borrar esta nota?")) {
      this.api.eliminarNota(id).subscribe({
        next: () => this.store.dispatch(cargarNotas()),
        error: (err) => alert("Error al borrar")
      });
    }
  }

  evitarSimbolos(event: any) {
    if (['-', '+', 'e', 'E'].includes(event.key)) {
      event.preventDefault();
      this.mostrarAvisoSimbolos = true;
      setTimeout(() => {
        this.mostrarAvisoSimbolos = false;
      }, 2000);
    }
  }

  validarRango() {
    if (this.valorNota !== null) {
      if (this.valorNota < 0) this.valorNota = 0;
      if (this.valorNota > 10) this.valorNota = 10;
    }
  }
}