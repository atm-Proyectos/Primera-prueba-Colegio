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
    // Carga inicial de datos
    this.store.dispatch(cargarAsignaturas());
    this.cargarListaProfesores();
  }

  cargarListaProfesores() {
    this.api.getProfesores().subscribe(data => {
      this.listaProfesores = data;
    });
  }

  // ==========================================
  // LÓGICA DE ALUMNO (Botón Inteligente)
  // ==========================================

  matricularse(asignatura: any) {
    const usuario = this.api.getUserName();

    this.api.getAlumnos().subscribe(todos => {
      // 👇 TRUCO: Función para limpiar tildes y espacios
      const limpiar = (texto: string) =>
        texto?.toLowerCase()
          .normalize("NFD") // Descompone "ó" en "o" + "´"
          .replace(/[\u0300-\u036f]/g, "") // Borra los simbolitos de acentos
          .replace(/\s/g, ""); // Borra espacios

      const miUsuarioLimpio = limpiar(usuario || '');

      const yo = todos.find((a: any) => {
        const nombreCompletoBD = limpiar(a.nombre + ' ' + a.apellido);
        // Debug opcional para ver que ahora sí coinciden
        // console.log(`Comparando: ${miUsuarioLimpio} vs ${nombreCompletoBD}`); 
        return nombreCompletoBD === miUsuarioLimpio;
      });

      if (yo) {
        this.api.matricular(yo.id, asignatura.id).subscribe({
          next: () => {
            Swal.fire({
              title: '¡Apuntado!',
              text: `Te has matriculado en ${asignatura.clase}`,
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
            this.store.dispatch(cargarAsignaturas());
          },
          error: (err) => {
            // 🔍 Aquí capturamos el mensaje del Backend
            // Si el backend envía un objeto con 'mensaje', lo usamos. Si no, ponemos uno por defecto.
            const mensajeDelServidor = err.error?.mensaje || "No se pudo realizar la matrícula";

            Swal.fire({
              title: 'Atención',
              text: mensajeDelServidor,
              icon: 'warning',
              confirmButtonColor: '#3498db'
            });

            console.error("Detalle del error:", err);
          }
        });
      } else {
        Swal.fire('Error', 'No pude encontrar tu perfil de alumno. Revisa que tu nombre coincida.', 'error');
        console.warn("Usuario del token no encontrado en lista de alumnos:", miUsuarioLimpio);
      }
    });
  }

  desmatricularse(asignatura: any) {
    if (!asignatura.matriculaId) return;

    Swal.fire({
      title: '¿Darte de baja?',
      text: `Saldrás de la clase de ${asignatura.clase}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e74c3c',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar'
    }).then((res) => {
      if (res.isConfirmed) {
        // Usamos el ID de la matrícula que nos dio el Backend en el DTO
        this.api.eliminarMatricula(asignatura.matriculaId).subscribe({
          next: () => {
            Swal.fire('Hecho', 'Te has desmatriculado correctamente', 'success');
            // Recargamos la tabla para que el botón vuelva a ser VERDE
            this.store.dispatch(cargarAsignaturas());
          },
          error: (err) => {
            // 🔍 Aquí capturamos el mensaje del Backend
            // Si el backend envía un objeto con 'mensaje', lo usamos. Si no, ponemos uno por defecto.
            const mensajeDelServidor = err.error?.mensaje || "No se pudo desmatricular";

            Swal.fire({
              title: 'Atención',
              text: mensajeDelServidor,
              icon: 'warning',
              confirmButtonColor: '#3498db'
            });

            console.error("Detalle del error:", err);
          }
        });
      }
    });
  }

  // ==========================================
  // LÓGICA DE ADMIN (CRUD Asignaturas)
  // ==========================================

  abrirModalCrear() {
    this.formAsignatura = { id: 0, clase: "", profesor: "" };
    this.mostrarModal = true;
  }

  editar(asig: any) {
    this.formAsignatura = { ...asig };
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  guardar() {
    if (this.formAsignatura.id === 0) {
      this.api.guardarAsignatura(this.formAsignatura).subscribe(() => {
        this.cerrarModal();
        this.store.dispatch(cargarAsignaturas());
        Swal.fire('Creado', 'Asignatura creada con éxito', 'success');
      });
    } else {
      this.api.editarAsignatura(this.formAsignatura.id, this.formAsignatura).subscribe(() => {
        this.cerrarModal();
        this.store.dispatch(cargarAsignaturas());
        Swal.fire('Actualizado', 'Asignatura editada con éxito', 'success');
      });
    }
  }

  eliminar(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Se borrará la asignatura permanentemente",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, borrar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.api.eliminarAsignatura(id).subscribe(() => {
          this.store.dispatch(cargarAsignaturas());
          Swal.fire('Borrado', 'La asignatura ha sido eliminada.', 'success');
        });
      }
    });
  }

  // ==========================================
  // LÓGICA DE ADMIN
  // ==========================================

  abrirModalNuevoProfesor() {
    this.formProfesor = { nombre: "", asignaturaInicial: "" };
    this.mostrarModalProfesor = true;
  }

  cerrarModalProfesor() {
    this.mostrarModalProfesor = false;
  }

  crearProfesorYAsignatura() {
    if (!this.formProfesor.nombre || !this.formProfesor.asignaturaInicial) {
      Swal.fire('Atención', 'Nombre y Asignatura son obligatorios', 'warning');
      return;
    }

    const datosEnvio = {
      nombre: this.formProfesor.nombre,
      asignaturaInicial: this.formProfesor.asignaturaInicial
    };

    this.api.crearProfesor(datosEnvio).subscribe({
      next: (resp: any) => {
        this.cerrarModalProfesor();
        this.store.dispatch(cargarAsignaturas());
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
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'No se pudo crear el profesor', 'error');
      }
    });
  }
}