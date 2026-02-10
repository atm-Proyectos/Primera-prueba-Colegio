import { Component } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  // Inyectamos el servicio como 'public' para usarlo en el HTML
  constructor(public api: ApiService, private router: Router) { }

  get nombreUsuario(): string {
    return this.api.getUserName() || '';
  }

  get rolUsuario(): string {
    return this.api.getRol() || '';
  }

  salir() {
    this.api.logout(); // Borra el token
    this.router.navigate(['/login']); // Nos manda al login
  }
}