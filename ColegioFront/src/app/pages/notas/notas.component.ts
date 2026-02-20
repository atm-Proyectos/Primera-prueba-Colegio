import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
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

  @ViewChild('formNotas') formNotas!: NgForm;

  notas$: Observable<Notas[]>;
  cargando$: Observable<boolean>;
  error$: Observable<any>;

  listaNotas: any[] = [];
  listaAlumnos: any[] = [];
  listaMatriculas: any[] = [];

  listaAsignaturas: any[] = []; // Todas las asignaturas del sistema
  listaAsignaturasDelAlumno: any[] = []; // Solo las del alumno seleccionado

  mensajeError: string = "";
  cargando: boolean = true;

  formSeleccion: any = { AlumnoId: null, AsignaturaId: null };
  valorNota: number | null = null; // Iniciamos en null
  notaIdEditar: number = 0;

  constructor(
    public api: ApiService,
    private store: Store<{ notas: any }>) {
    this.notas$ = this.store.select(state => state.notas.notas);
    this.cargando$ = this.store.select(state => state.notas.cargando);
    this.error$ = this.store.select(state => state.notas.error);
  }

  ngOnInit(): void {
    // Carga inicial de datos
    this.store.dispatch(cargarNotas());

    if (this.api.soyProfesor() || this.api.soyAdmin()) {
      forkJoin({
        alumnos: this.api.getAlumnos(),
        matriculas: this.api.getMatriculas(),
        asignaturas: this.api.getAsignaturas()
      }).subscribe({
        next: (res) => {
          this.listaAlumnos = res.alumnos;
          this.listaMatriculas = res.matriculas;
          this.listaAsignaturas = res.asignaturas;
          this.cargando = false;
        },
        error: (err) => {
          console.error("Error cargando datos auxiliares", err);
          this.cargando = false;
        }
      });
    }
  }

  // --- LÓGICA DE FILTRADO ---

  // 1. Esta función se llama cuando TU cambias el select manualmente
  alCambiarAlumno() {
    const AlumnoId = this.formSeleccion.AlumnoId;

    // Cargamos la lista
    this.cargarAsignaturasParaAlumno(AlumnoId);

    // Como has cambiado de alumno manualmente, reseteamos la asignatura
    this.formSeleccion.AsignaturaId = null;
  }

  // 2. Función auxiliar para reutilizar lógica (sin borrar selecciones)
  cargarAsignaturasParaAlumno(AlumnoId: number) {
    if (AlumnoId) {
      // Filtramos las matrículas de ese alumno
      const matriculasDelAlumno = this.listaMatriculas.filter(m => m.AlumnoId == AlumnoId);

      // Cruzamos con la lista de asignaturas para sacar el nombre
      this.listaAsignaturasDelAlumno = matriculasDelAlumno.map(m => {
        const asignaturaOriginal = this.listaAsignaturas.find(a => a.Id == m.AsignaturaId);
        return {
          Id: m.AsignaturaId,
          Nombre: asignaturaOriginal ? asignaturaOriginal.Clase : ('Asignatura ' + m.AsignaturaId)
        };
      });
    } else {
      this.listaAsignaturasDelAlumno = [];
    }
  }

  // --- VALIDACIÓN ESTRICTA DE NOTAS ---
  validarNota(event: any) {
    const input = event.target;
    let valor = parseFloat(input.value);

    // 1. Si no es un número (ej. han borrado todo), permitimos dejarlo vacío momentáneamente
    if (isNaN(valor)) {
      return;
    }

    // 2. Si es menor que 0, lo ponemos a 0
    if (valor < 0) {
      this.valorNota = 0;
      input.value = 0; // Forzamos visualmente en el input
    }
    // 3. Si es mayor que 10, lo ponemos a 10
    else if (valor > 10) {
      this.valorNota = 10;
      input.value = 10; // Forzamos visualmente en el input
    }
    // 4. Si está correcto, actualizamos la variable
    else {
      this.valorNota = valor;
    }
  }

  // --- GUARDAR / ACTUALIZAR ---
  guardar() {
    // Validaciones previas
    if (!this.formSeleccion.AlumnoId || !this.formSeleccion.AsignaturaId) {
      this.mensajeError = "Selecciona alumno y asignatura.";
      return;
    }
    if (this.valorNota === null || this.valorNota === undefined) {
      this.mensajeError = "Escribe una nota válida.";
      return;
    }

    // Buscamos el ID de la matrícula (AsignaturaAlumnoId)
    const matricula = this.listaMatriculas.find(
      m => m.AlumnoId == this.formSeleccion.AlumnoId &&
        m.AsignaturaId == this.formSeleccion.AsignaturaId
    );

    if (!matricula) {
      this.mensajeError = "Este alumno no está matriculado en esa asignatura.";
      return;
    }

    // Objeto a enviar
    const notaAGuardar = {
      Id: this.notaIdEditar, // 0 si es nueva, ID si es editar
      Valor: this.valorNota, // Usamos la variable vinculada
      AsignaturaAlumnoId: matricula.Id
    };

    if (this.notaIdEditar === 0) {
      // CREAR
      this.api.guardarNota(notaAGuardar).subscribe({
        next: () => {
          Swal.fire('Guardado', 'Nota registrada correctamente', 'success');
          this.store.dispatch(cargarNotas());
          this.limpiar();
        },
        error: () => Swal.fire('Error', 'No se pudo guardar la nota', 'error')
      });
    } else {
      // EDITAR
      this.api.editarNota(this.notaIdEditar, notaAGuardar).subscribe({
        next: () => {
          Swal.fire('Actualizado', 'Nota modificada correctamente', 'success');
          this.store.dispatch(cargarNotas());
          this.limpiar();
        },
        error: () => Swal.fire('Error', 'No se pudo actualizar', 'error')
      });
    }
  }

  // --- EDITAR ---
  editar(nota: any) {
    this.notaIdEditar = nota.Id;
    this.valorNota = nota.Valor;

    // Buscamos la matrícula basada en la relación guardada en la nota
    // Esto es más seguro que buscar por IDs sueltos
    let matricula = this.listaMatriculas.find(m => m.Id === nota.AsignaturaAlumnoId);

    // Fallback: Si no viene asignaturaAlumnoId, intentamos buscar por los objetos anidados (si tu API los devuelve)
    if (!matricula && nota.AsignaturaAlumno) {
      matricula = this.listaMatriculas.find(m => m.Id === nota.AsignaturaAlumno.Id);
    }

    if (matricula) {
      // 1. Seteamos Alumno
      this.formSeleccion.AlumnoId = matricula.AlumnoId;

      // 2. Cargamos sus asignaturas SIN borrar la selección (usamos la función auxiliar)
      this.cargarAsignaturasParaAlumno(matricula.AlumnoId);

      // 3. Seteamos Asignatura
      this.formSeleccion.AsignaturaId = matricula.AsignaturaId;
    } else {
      console.warn("No se encontró la matrícula para editar esta nota");
    }

    Swal.fire({
      icon: 'info',
      title: 'Modo Edición',
      text: 'Modifica el valor y guarda.',
      timer: 1500,
      showConfirmButton: false
    });
  }

  limpiar() {
    this.notaIdEditar = 0;
    this.valorNota = null;
    this.formSeleccion = { AlumnoId: null, AsignaturaId: null };
    this.listaAsignaturasDelAlumno = [];
    this.mensajeError = "";
    if (this.formNotas) {
      this.formNotas.resetForm();
    }
  }

  eliminar(Id: number) {
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
        this.api.eliminarNota(Id).subscribe({
          next: () => {
            Swal.fire('Borrado', 'La nota ha sido eliminada.', 'success');
            this.store.dispatch(cargarNotas());
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar.', 'error')
        });
      }
    });
  }
}