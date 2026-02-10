import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InicioComponent } from './pages/inicio/inicio.component';
import { AlumnosComponent } from './pages/alumnos/alumnos.component';
import { AsignaturasComponent } from './pages/asignaturas/asignaturas.component';
import { NotasComponent } from './pages/notas/notas.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './pages/login/login.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'inicio', component: InicioComponent },
  { path: 'alumnos', component: AlumnosComponent },
  { path: 'asignaturas', component: AsignaturasComponent },
  { path: 'notas', component: NotasComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }