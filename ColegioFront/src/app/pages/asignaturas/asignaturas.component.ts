import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-asignaturas',
  templateUrl: './asignaturas.component.html',
  styleUrls: ['./asignaturas.component.css']
})
export class AsignaturasComponent implements OnInit {
  listaAsignaturas: any[] = [];

  formAsignatura = { id: 0, clase: "", profesor: "" };

  mensajeError: string = "";
  cargando: boolean = true;

  constructor(private api: ApiService) { }

  ngOnInit(): void {
    this.cargarAsignaturas();
  }

  cargarAsignaturas() {
    this.cargando = true;
    this.api.getAsignaturas().subscribe({
      next: (data) => {
        this.listaAsignaturas = data;
        this.cargando = false;
      },
      error: (err) => { console.error(err); this.cargando = false; }
    });
  }

  guardar() {
    this.mensajeError = "";
    const peticion = this.formAsignatura.id === 0
      ? this.api.guardarAsignatura(this.formAsignatura)
      : this.api.editarAsignatura(this.formAsignatura.id, this.formAsignatura);

    peticion.subscribe({
      next: () => { this.cargarAsignaturas(); this.limpiar(); },
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
        next: () => this.cargarAsignaturas(),
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