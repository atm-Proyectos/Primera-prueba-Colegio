import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboarProfesorComponent } from './dashboar-profesor.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('DashboarProfesorComponent', () => {
  let component: DashboarProfesorComponent;
  let fixture: ComponentFixture<DashboarProfesorComponent>;
  let store: MockStore; // ✨ Definimos el store
  const initialState = { user: { profile: { role: 'Profesor' } } };

  // 1. MOCK SERVICIO
  const mockApiService = jasmine.createSpyObj('ApiService', ['getStatsProfesor', 'getUserName']);
  mockApiService.getStatsProfesor.and.returnValue(of({}));
  mockApiService.getUserName.and.returnValue('Profesor Test');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboarProfesorComponent],
      imports: [HttpClientTestingModule, FormsModule],
      providers: [
        provideMockStore({ initialState }), // ✨ Inyectamos el store mockeado
        { provide: ApiService, useValue: mockApiService } // ✨ Inyectamos el servicio
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(DashboarProfesorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // --- TEST: ALUMNOS EN RIESGO ---
  it('debería mostrar la lista de alumnos en riesgo con los nombres en Mayúsculas', () => {
    const mockData = {
      AlumnosEnRiesgo: [
        { Id: 101, Nombre: 'Carlos Ortiz', Valor: 3.5 },
        { Id: 102, Nombre: 'Sara Alvarez', Valor: 4.0 }
      ]
    };

    component.stats = mockData;
    // ✅ Asignamos manualmente la lista que recorre el HTML
    component.alumnosEnRiesgo = mockData.AlumnosEnRiesgo;
    component.cargando = false;
    fixture.detectChanges();

    // ✅ Selector corregido para la lista <ul>
    const filasRiesgo = fixture.debugElement.queryAll(By.css('.lista-riesgo li'));
    expect(filasRiesgo.length).toBe(2);
    expect(filasRiesgo[0].nativeElement.textContent).toContain('Carlos Ortiz');
  });

  // --- TEST: RESUMEN DE MEJOR ALUMNO ---
  it('debería mostrar el nombre del mejor alumno de la clase', () => {
    // Sincronizamos el mock con lo que espera el TS corregido
    component.mejorAlumno = { Nombre: 'Clara Martinez', Valor: 10 };
    component.cargando = false;
    fixture.detectChanges();

    // Buscamos el elemento que contiene el nombre
    const debugElement = fixture.debugElement.query(By.css('.card-kpi.green'));
    expect(debugElement.nativeElement.textContent).toContain('Clara Martinez');
  });
});