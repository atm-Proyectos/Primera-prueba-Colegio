import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-alumnos',
  templateUrl: './alumnos.component.html',
  styleUrls: ['./alumnos.component.css']
})
export class AlumnosComponent implements OnInit {
  listaAlumnos: any[] = [];
  
  // Objeto para el formulario (vinculado con ngModel)
  alumnoForm = {
    id: 0,
    nombre: '',
    apellido: '',
    edad: null
  };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.api.getAlumnos().subscribe(datos => this.listaAlumnos = datos);
  }

  // Función para GUARDAR o ACTUALIZAR
  guardar() {
    if (this.alumnoForm.id === 0) {
      //POST
      this.api.guardarAlumno(this.alumnoForm).subscribe(() => {
        this.cargarDatos();
        this.limpiarFormulario();
      });
    } else {
      //PUT
      this.api.editarAlumno(this.alumnoForm.id, this.alumnoForm).subscribe(() => {
        this.cargarDatos();
        this.limpiarFormulario();
      });
    }
  }

  // Función para llenar el formulario al dar a Editar
  editar(alumno: any) {
    this.alumnoForm = { ...alumno };
  }

  borrar(id: number) {
    if(confirm('¿Borrar alumno?')) {
      this.api.eliminarAlumno(id).subscribe(() => this.cargarDatos());
    }
  }

  limpiarFormulario() {
    this.alumnoForm = { id: 0, nombre: '', apellido: '', edad: null };
  }
}