import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-notas',
  templateUrl: './notas.component.html',
  styleUrls: ['./notas.component.css']
})
export class NotasComponent implements OnInit {
  listaNotas: any[] = [];
  listaAlumnos: any[] = [];
  listaMatriculas: any[] = [];

  listaAsignaturasDelAlumno: any[] = [];

  mensajeError: string = "";
  cargando: boolean = true;

  formSeleccion: any = { alumnoId: null, asignaturaId: null };

  // Dato real para la nota
  valorNota: number | null = null;
  notaIdEditar: number = 0;

  constructor(private api: ApiService) { }

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  cargarDatosIniciales() {
    this.cargando = true;
    // Cargamos Notas, Alumnos y Matrículas a la vez
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

      // Mapeamos para sacar solo Nombre asignatura y el ID de la asignatura original
      this.listaAsignaturasDelAlumno = matriculas.map(m => ({
        idAsignaturaReal: m.asignaturaId,
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
    if (this.notaIdEditar === 0) {
      this.api.guardarNota(notaParaEnviar).subscribe({
        next: () => { this.cargarDatosIniciales(); this.limpiar(); },
        error: (err) => { console.error(err); this.mensajeError = "🛑 Error al guardar."; }
      });
    } else {
      this.api.editarNota(this.notaIdEditar, notaParaEnviar).subscribe({
        next: () => { this.cargarDatosIniciales(); this.limpiar(); },
        error: (err) => { console.error(err); this.mensajeError = "🛑 Error al editar."; }
      });
    }
  }

  editar(nota: any) {
    this.notaIdEditar = nota.id;
    this.valorNota = nota.valor;

    // Rellenar los combos visualmente
    this.formSeleccion.alumnoId = nota.alumnoId;
    this.alCambiarAlumno();

    // Pequeño retardo para que dé tiempo a cargarse el combo antes de seleccionar
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
    if (confirm("¿Borrar nota?")) {
      this.api.eliminarNota(id).subscribe(() => this.cargarDatosIniciales());
    }
  }
}