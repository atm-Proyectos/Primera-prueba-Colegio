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
    if (this.formAsignatura.id === 0) {
      this.api.guardarAsignatura(this.formAsignatura).subscribe({
        next: () => { this.cargarAsignaturas(); this.limpiar(); },
        error: (err) => { console.error(err); this.mensajeError = "🛑 Error al crear."; }
      });
    } else {
      this.api.editarAsignatura(this.formAsignatura.id, this.formAsignatura).subscribe({
        next: () => { this.cargarAsignaturas(); this.limpiar(); },
        error: (err) => { console.error(err); this.mensajeError = "🛑 Error al actualizar."; }
      });
    }
  }

  editar(item: any) {
    this.formAsignatura = { ...item };
  }

  eliminar(id: number) {
    if (confirm("¿Borrar asignatura?")) {
      this.api.eliminarAsignatura(id).subscribe(() => this.cargarAsignaturas());
    }
  }

  limpiar() {
    this.formAsignatura = { id: 0, clase: "", profesor: "" };
    this.mensajeError = "";
  }
}