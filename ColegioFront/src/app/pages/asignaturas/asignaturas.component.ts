import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Store } from '@ngrx/store';
import { cargarAsignaturas } from 'src/app/state/Asignaturas/asignaturas.actions';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-asignaturas',
  templateUrl: './asignaturas.component.html',
  styleUrls: ['./asignaturas.component.css']
})
export class AsignaturasComponent implements OnInit {

  asignaturas$: Observable<any[]>;
  cargando$: Observable<boolean>;
  error$: Observable<any>;

  // Variables formulario Asignatura (existente)
  formAsignatura: any = { id: 0, clase: "", profesor: "" };
  mostrarModal: boolean = false;
  listaProfesores: any[] = [];
  mensajeError: string = "";

  // Variables formulario Nuevo Profesor (Simplificado)
  mostrarModalProfesor: boolean = false;
  formProfesor: any = { nombre: "", asignaturaInicial: "" };

  constructor(
    public api: ApiService,
    private store: Store<{ asignaturas: any }>) {

    this.asignaturas$ = this.store.select(state => state.asignaturas.asignaturas);
    this.cargando$ = this.store.select(state => state.asignaturas.loading);
    this.error$ = this.store.select(state => state.asignaturas.error);
  }

  ngOnInit(): void {
    this.store.dispatch(cargarAsignaturas());
    if (this.api.soyAdmin()) {
      this.cargarListaProfesores();
    }
  }

  cargarListaProfesores() {
    this.api.getProfesores().subscribe({
      next: (data: any) => this.listaProfesores = data,
      error: () => console.error("Error cargando profesores")
    });
  }

  // --- LÓGICA MODAL ASIGNATURA (Profesor ya existente) ---
  abrirModalCrear() {
    this.limpiar();
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.mensajeError = "";
  }

  guardar() {
    if (this.formAsignatura.id === 0) {
      this.api.guardarAsignatura(this.formAsignatura).subscribe({
        next: () => {
          Swal.fire('Creada', 'Asignatura añadida correctamente', 'success');
          this.store.dispatch(cargarAsignaturas());
          this.cerrarModal();
        },
        error: (err: any) => Swal.fire('Error', this.traducirError(err), 'error')
      });
    } else {
      this.api.editarAsignatura(this.formAsignatura.id, this.formAsignatura).subscribe({
        next: () => {
          Swal.fire('Actualizada', 'Datos modificados', 'success');
          this.store.dispatch(cargarAsignaturas());
          this.cerrarModal();
        },
        error: (err: any) => Swal.fire('Error', this.traducirError(err), 'error')
      });
    }
  }

  editar(item: any) {
    this.formAsignatura = { ...item };
    this.mostrarModal = true;
  }

  eliminar(id: number) {
    Swal.fire({
      title: '¿Borrar asignatura?',
      text: "Se borrarán las matrículas asociadas.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, borrar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.api.eliminarAsignatura(id).subscribe({
          next: () => {
            Swal.fire('Borrada', 'Asignatura eliminada.', 'success');
            this.store.dispatch(cargarAsignaturas());
          },
          error: (err: any) => Swal.fire('Error', this.traducirError(err), 'error')
        })
      }
    });
  }

  limpiar() {
    this.formAsignatura = { id: 0, clase: "", profesor: "" };
  }

  traducirError(err: any): string {
    return err?.error || err?.message || "Ocurrió un error inesperado.";
  }

  // --- NUEVA LÓGICA: CREAR PROFESOR Y ASIGNATURA (TODO EN UNO) ---

  abrirModalNuevoProfesor() {
    this.formProfesor = { nombre: "", asignaturaInicial: "" };
    this.mostrarModalProfesor = true;
  }

  cerrarModalProfesor() {
    this.mostrarModalProfesor = false;
  }

  crearProfesorYAsignatura() {
    // 1. Validar
    if (!this.formProfesor.nombre || !this.formProfesor.asignaturaInicial) {
      Swal.fire('Atención', 'Nombre y Asignatura son obligatorios', 'warning');
      return;
    }

    // 2. Enviar al Backend (que ahora hace TODO el trabajo)
    const datosEnvio = {
      nombre: this.formProfesor.nombre,
      asignaturaInicial: this.formProfesor.asignaturaInicial
    };

    this.api.crearProfesor(datosEnvio).subscribe({
      next: (resp: any) => {
        // Al volver, el backend ya creó todo. Solo notificamos.

        this.cerrarModalProfesor();

        // Refrescamos la tabla de asignaturas
        this.store.dispatch(cargarAsignaturas());
        // Refrescamos el select de profesores
        this.cargarListaProfesores();

        Swal.fire({
          title: '¡Profesor Contratado!',
          html: `
            <div style="text-align: left;">
              <p>✅ Se ha creado el profesor y la asignatura <b>${resp.asignatura}</b>.</p>
              <hr>
              <p>👤 <b>Usuario:</b> ${resp.usuario}</p>
              <p>🔑 <b>Contraseña:</b> ${resp.passwordGenerada}</p>
            </div>
          `,
          icon: 'success'
        });
      },
      error: (err: any) => {
        console.error(err);
        Swal.fire('Error', 'No se pudo crear el profesor: ' + this.traducirError(err), 'error');
      }
    });
  }
}