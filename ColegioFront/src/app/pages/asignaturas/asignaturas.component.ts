import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Asignaturas } from 'src/app/models/asignaturas.model';
import { Store } from '@ngrx/store';
import { cargarAsignaturas } from 'src/app/state/Asignaturas/asignaturas.actions';
import { Observable } from 'rxjs';

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
    const peticion = this.formAsignatura.id === 0
      ? this.api.guardarAsignatura(this.formAsignatura)
      : this.api.editarAsignatura(this.formAsignatura.id, this.formAsignatura);

    peticion.subscribe({
      next: () => {
        this.store.dispatch(cargarAsignaturas());
        this.limpiar();
      },
      error: (err) => {
        this.mensajeError = this.traducirError(err);
        setTimeout(() => this.mensajeError = "", 5000);
      }
    });
  }

  editar(item: any) {
    this.formAsignatura = { ...item };
  }

  eliminar(id: number) {
    if (confirm("¿Borrar asignatura? Cuidado si tiene alumnos...")) {
      this.api.eliminarAsignatura(id).subscribe({
        next: () => this.store.dispatch(cargarAsignaturas()),
        error: (err) => {
          this.mensajeError = this.traducirError(err);
          setTimeout(() => this.mensajeError = "", 5000);
        }
      })
    }
  }

  limpiar() {
    this.formAsignatura = { id: 0, clase: "", profesor: "" };
    this.mensajeError = "";
  }

  private traducirError(err: any): string {
    let mensaje = err.error?.title || err.error || err.message || "";

    if (mensaje.includes("Foreign key") || mensaje.includes("constraint")) {
      return "🛑 No se puede borrar: Hay alumnos matriculados o notas puestas en esta asignatura.";
    }
    if (err.status === 0) return "🛑 Error de conexión con el servidor.";
    if (err.status === 400) return "🛑 Datos inválidos.";

    return "🛑 Error: " + mensaje;
  }
}