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
  listaAsignaturas: any[] = [];

  // Formulario con ID
  formNota = { id: 0, alumnoId: 0, asignaturaId: 0, valor: 0 };
  constructor(private api: ApiService) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    //1 NOTAS
    this.api.getNotas().subscribe(data => this.listaNotas = data);
    //2 ALUMNOS
    this.api.getAlumnos().subscribe(data => this.listaAlumnos = data);
    //3 ASIGNATURAS
    this.api.getAsignaturas().subscribe(data => this.listaAsignaturas = data);
  }

  guardar() {
    if (this.formNota.id === 0) {
      this.api.guardarNota(this.formNota).subscribe(() => {
        this.cargarDatos();
        this.limpiar();
      });
    } else {
      this.api.editarNota(this.formNota.id, this.formNota).subscribe(() => {
        this.cargarDatos();
        this.limpiar();
      });
    }
    }

    editar(item: any) {
      this.formNota = { 
        id: item.id,
        alumnoId: item.alumnoId,
        asignaturaId: item.asignaturaId,
        valor: item.valor
       };
    }

    borrar(id: number) {
      if(confirm('¿Borrar esta nota?')) {
        this.api.eliminarNota(id).subscribe(() => this.cargarDatos());
      }
    }

    limpiar() {
      this.formNota = { id: 0, alumnoId: 0, asignaturaId: 0, valor: 0 };
    }
  }


