import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Asignaturas } from 'src/app/models/asignaturas.model';
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

  asignaturas$: Observable<Asignaturas[]>;
  cargando$: Observable<boolean>;
  error$: Observable<any>;

  formAsignatura = { id: 0, clase: "", profesor: "" };

  mensajeError: string = "";

  constructor(
    private api: ApiService,
    private store: Store<{ asignaturas: any }>) {

    this.asignaturas$ = this.store.select(state => state.asignaturas.asignaturas);
    this.cargando$ = this.store.select(state => state.asignaturas.loading);
    this.error$ = this.store.select(state => state.asignaturas.error);
  }

  ngOnInit(): void {
    this.store.dispatch(cargarAsignaturas());
  }

  guardar() {
    this.mensajeError = "";

    // Validación básica antes de enviar
    if (!this.formAsignatura.clase || !this.formAsignatura.profesor) {
      Swal.fire('Faltan datos', 'Por favor, rellena Clase y Profesor.', 'warning');
      return;
    }

    const peticion = this.formAsignatura.id === 0
      ? this.api.guardarAsignatura(this.formAsignatura)
      : this.api.editarAsignatura(this.formAsignatura.id, this.formAsignatura);

    peticion.subscribe({
      next: () => {
        // Alerta Éxito
        Swal.fire({
          icon: 'success',
          title: this.formAsignatura.id === 0 ? 'Creada' : 'Actualizada',
          text: 'La asignatura se ha guardado correctamente.',
          timer: 1500,
          showConfirmButton: false
        });

        this.store.dispatch(cargarAsignaturas());
        this.limpiar();
      },
      error: (err) => {
        // Usamos tu función traducirError pero mostramos el resultado en SweetAlert
        const msg = this.traducirError(err);
        Swal.fire('Error', msg, 'error');
      }
    });
  }

  editar(item: any) {
    this.formAsignatura = { ...item };
  }

  eliminar(id: number) {
    // Confirmación con SweetAlert
    Swal.fire({
      title: '¿Borrar asignatura?',
      text: "Si tiene alumnos matriculados, podría dar error o borrar sus notas.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.api.eliminarAsignatura(id).subscribe({
          next: () => {
            Swal.fire('Borrada', 'La asignatura ha sido eliminada.', 'success');
            this.store.dispatch(cargarAsignaturas());
          },
          error: (err) => {
            const msg = this.traducirError(err);
            Swal.fire('No se pudo borrar', msg, 'error');
          }
        })
      }
    });
  }

  limpiar() {
    this.formAsignatura = { id: 0, clase: "", profesor: "" };
    this.mensajeError = "";
  }

  private traducirError(err: any): string {
    let mensaje = err.error?.title || err.error || err.message || "";
    if (mensaje.includes("Foreign key")) return "No se puede borrar: Hay alumnos matriculados o notas asociadas.";
    return mensaje;
  }
}