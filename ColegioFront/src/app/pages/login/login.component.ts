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

    this.api.login(credenciales).subscribe({
      next: (data) => {
        console.log('Login correcto:', data);

        // Guardamos el token en localStorage
        localStorage.setItem('token', data.token);

        // Ahora que está guardado, nos vamos al dashboard
        this.router.navigate(['/inicio']);
      },
      error: (err) => {
        console.error('Error login:', err);
        this.error = "Usuario o contraseña incorrectos";
      }
    });
  }
}