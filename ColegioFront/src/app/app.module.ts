import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { alumnosReducer } from './state/Alumnos/alumnos.reducer';
import { AlumnosEffects } from './state/Alumnos/alumnos.effects';
import { asignaturasReducer } from './state/Asignaturas/asignaturas.reducer';
import { AsignaturasEffects } from './state/Asignaturas/asignaturas.effects';
import { notasReducer } from './state/Notas/notas.reducer';
import { NotasEffects } from './state/Notas/notas.effects';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { InicioComponent } from './pages/inicio/inicio.component';
import { AlumnosComponent } from './pages/alumnos/alumnos.component';
import { AsignaturasComponent } from './pages/asignaturas/asignaturas.component';
import { NotasComponent } from './pages/notas/notas.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { SpinnerComponent } from './components/spinner/spinner.component';


@NgModule({
  declarations: [AppComponent, InicioComponent, AlumnosComponent, AsignaturasComponent, NotasComponent, NavbarComponent, FooterComponent, SpinnerComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    StoreModule.forRoot({ alumnos: alumnosReducer, asignaturas: asignaturasReducer, notas: notasReducer }),
    EffectsModule.forRoot([AlumnosEffects, AsignaturasEffects, NotasEffects]),
    StoreDevtoolsModule.instrument({ maxAge: 19 })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }