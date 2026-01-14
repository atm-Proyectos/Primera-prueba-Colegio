import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-asignaturas',
  templateUrl: './asignaturas.component.html',
  styleUrls: ['./asignaturas.component.css']
})
export class AsignaturasComponent implements OnInit {
  listaAsig: any[] = [];
  formAsig = { id: 0, clase: '', profesor: '' };

  constructor(private api: ApiService) {}

  ngOnInit() { this.cargar(); }

  cargar() {
    this.api.getAsignaturas().subscribe(data => this.listaAsig = data);
  }

  guardar() {
    if (this.formAsig.id === 0) {
      this.api.guardarAsignatura(this.formAsig).subscribe(() => {
        this.cargar();
        this.limpiar();
      });
    } else {
      this.api.editarAsignatura(this.formAsig.id, this.formAsig).subscribe(() => {
        this.cargar();
        this.limpiar();
      });
    }
  }

  editar(item: any) { this.formAsig = { ...item }; }
  
  borrar(id: number) {
    if(confirm('¿Borrar asignatura?')) {
      this.api.eliminarAsignatura(id).subscribe(() => this.cargar());
    }
  }

  limpiar() { this.formAsig = { id: 0, clase: '', profesor: '' }; }
}