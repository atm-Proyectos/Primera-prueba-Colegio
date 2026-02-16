import { NgModule } from '@angular/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthInterceptor } from './services/auth.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { alumnosReducer } from './state/Alumnos/alumnos.reducer';
import { AlumnosEffects } from './state/Alumnos/alumnos.effects';
import { asignaturasReducer } from './state/Asignaturas/asignaturas.reducer';
import { AsignaturasEffects } from './state/Asignaturas/asignaturas.effects';
import { notasReducer } from './state/Notas/notas.reducer';
import { NotasEffects } from './state/Notas/notas.effects';
import { dashboardReducer } from './state/Dashboard/dashboard.reducer';
import { DashboardEffects } from './state/Dashboard/dashboard.effects';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { InicioComponent } from './pages/inicio/inicio.component';
import { AlumnosComponent } from './pages/alumnos/alumnos.component';
import { AsignaturasComponent } from './pages/asignaturas/asignaturas.component';
import { NotasComponent } from './pages/notas/notas.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './pages/login/login.component';
import { PerfilAlumnoComponent } from './pages/perfil-alumno/perfil-alumno.component';
import { DashboarProfesorComponent } from './pages/dashboar-profesor/dashboar-profesor.component';

@NgModule({
  declarations: [
    AppComponent,
    InicioComponent,
    AlumnosComponent,
    AsignaturasComponent,
    NotasComponent,
    NavbarComponent,
    FooterComponent,
    SpinnerComponent,
    DashboardComponent,
    LoginComponent,
    PerfilAlumnoComponent,
    DashboarProfesorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    NgxChartsModule,
    StoreModule.forRoot({
      alumnos: alumnosReducer,
      asignaturas: asignaturasReducer,
      notas: notasReducer,
      dashboard: dashboardReducer
    }),
    EffectsModule.forRoot([
      AlumnosEffects,
      AsignaturasEffects,
      NotasEffects,
      DashboardEffects
    ]),
    StoreDevtoolsModule.instrument({ maxAge: 25 })
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }