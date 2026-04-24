import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  usuario: string = '';
  password: string = '';
  error: string = '';

  constructor(private api: ApiService, private router: Router) { }

  ingresar() {
    const credenciales = {
      username: this.usuario,
      password: this.password
    };
    // Llamamos al servicio y le pasamos un objeto con next y error
    this.api.login(credenciales).subscribe({
      next: (data: any) => {
<<<<<<< Updated upstream
        console.log('Login correcto:', data);
=======
        Swal.close();
>>>>>>> Stashed changes
        // Guardamos el token en localStorage, así que solo pedimos el rol
        const rol = this.api.getRol();
        if (rol === 'Admin') {
          this.router.navigate(['/dashboard']);
        } else if (rol === 'Profesor') {
          this.router.navigate(['/inicio']);
        } else if (rol === 'Alumno') {
          this.router.navigate(['/perfil-alumno']);
        }
      },
      error: (err: any) => {
<<<<<<< Updated upstream
        console.error('Error en el login:', err);
        this.error = 'Usuario o contraseña incorrectos';
=======
        Swal.close();
        Swal.fire({
          icon: 'error',
          title: 'Error en el login',
          text: 'Usuario o contraseña incorrectos',
          confirmButtonText: 'Aceptar'
        });
>>>>>>> Stashed changes
      }
    });
  }
}

