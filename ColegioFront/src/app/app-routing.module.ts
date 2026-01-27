import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InicioComponent } from './pages/inicio/inicio.component';
import { AlumnosComponent } from './pages/alumnos/alumnos.component';
import { AsignaturasComponent } from './pages/asignaturas/asignaturas.component';
import { NotasComponent } from './pages/notas/notas.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'inicio', component: InicioComponent },
  { path: 'alumnos', component: AlumnosComponent },
  { path: 'asignaturas', component: AsignaturasComponent },
  { path: 'notas', component: NotasComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }