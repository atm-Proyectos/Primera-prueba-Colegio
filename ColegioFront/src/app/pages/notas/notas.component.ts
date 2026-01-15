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
  mensajeError: string = "";
  cargando: boolean = true;

  // Formulario con ID
  formNota = { id: 0, alumnoId: null, asignaturaId: null, valor: 0 };

  constructor(private api: ApiService) {}

  ngOnInit(): void{
    this.cargarAlumnos();
    this.cargarAsignaturas();
    this.cargarNotas();
  }

  cargarAlumnos() {
    this.api.getAlumnos().subscribe(data => this.listaAlumnos = data);
  }

  cargarAsignaturas() {
    this.api.getAsignaturas().subscribe(data => this.listaAsignaturas = data);
  }

  cargarNotas() {
    this.cargando = true;
    this.api.getNotas().subscribe({
      next: (data) => {
        this.listaNotas = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
      }
    });
  }

  guardar() {
    // Limpiamos errores previos
    this.mensajeError = "";

    if (this.formNota.id === 0) {
      // CREAR
      this.api.guardarNota(this.formNota).subscribe({
        next: () => {
          this.cargarNotas();
          this.limpiar();
        },
        error: (err) => {
          console.error("Error del backend:", err);
          this.mensajeError = "🛑 Error: Revisa los datos (Nota 0-10 y campos obligatorios).";
        }
      });
    } else {
      // ACTUALIZAR
      this.api.editarNota(this.formNota.id, this.formNota).subscribe({
        next: () => {
          this.cargarNotas();
          this.limpiar();
        },
        error: (err) => {
          console.error("Error del backend:", err);
          this.mensajeError = "🛑 Error: No se pudo actualizar. Revisa los límites.";
        }
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
        this.api.eliminarNota(id).subscribe(() => this.cargarNotas());
      }
    }

    limpiar() {
      this.formNota = { id: 0, alumnoId: null, asignaturaId: null, valor: 0 };
    }
  }


