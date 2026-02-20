import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerfilAlumnoComponent } from './perfil-alumno.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { fakeAsync, tick } from '@angular/core/testing';

// Aqui se define el componente a testear
describe('PerfilAlumnoComponent', () => {
  let component: PerfilAlumnoComponent;
  let fixture: ComponentFixture<PerfilAlumnoComponent>;
  let store: MockStore;
  // Cambiamos el rol a Alumno para que tenga sentido
  const initialState = { user: { profile: { role: 'Alumno' } } };

  const mockApiService = jasmine.createSpyObj('ApiService', ['getStatsAlumno', 'getUserName']);
  mockApiService.getStatsAlumno.and.returnValue(of({}));
  mockApiService.getUserName.and.returnValue('Ignacio');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PerfilAlumnoComponent],
      imports: [HttpClientTestingModule, FormsModule],
      providers: [
        provideMockStore({ initialState }),
        { provide: ApiService, useValue: mockApiService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(PerfilAlumnoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Aqui se define el test
  it('debería mostrar el promedio global del alumno', () => {
    // 1. Datos falsos
    const datosFalsos = {
      Aprobadas: 5,
      Suspensas: 1,
      PromedioGlobal: 8.75,
      TotalAsignaturas: 6,
      Asignaturas: [],
      StatsTarta: []
    };
    mockApiService.getStatsAlumno.and.returnValue(of(datosFalsos));

    // 2. Ejecutamos la carga de datos
    component.cargarDatos();
    fixture.detectChanges();

    // 3. Buscamos Específicamente la tarjeta azul (Nota Media)
    const tarjetaPromedio = fixture.debugElement.query(By.css('.card-kpi.blue .promedio-valor'));

    expect(tarjetaPromedio).toBeTruthy();
    expect(tarjetaPromedio.nativeElement.textContent).toContain('8.75');
  });
});
