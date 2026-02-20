import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AsignaturasComponent } from './asignaturas.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AsignaturasComponent', () => {
  let component: AsignaturasComponent;
  let fixture: ComponentFixture<AsignaturasComponent>;
  let store: MockStore;
  const initialState = { asignaturas: { asignaturas: [], loading: false, error: null } };

  // 1. MOCK SERVICIO (Incluimos guardar, editar y eliminar)
  const mockApiService = jasmine.createSpyObj('ApiService', [
    'soyAdmin',
    'soyProfesor',
    'soyAlumno',
    'getRol',
    'getAsignaturas',
    'getProfesores',
    'guardarAsignatura',
    'editarAsignatura',
    'eliminarAsignatura'
  ]);
  mockApiService.getProfesores.and.returnValue(of([]));
  mockApiService.soyAdmin.and.returnValue(true);
  mockApiService.soyProfesor.and.returnValue(false);
  mockApiService.soyAlumno.and.returnValue(false);
  mockApiService.getRol.and.returnValue('Admin');
  mockApiService.getAsignaturas.and.returnValue(of([]));
  mockApiService.guardarAsignatura.and.returnValue(of({}));
  mockApiService.editarAsignatura.and.returnValue(of({}));
  mockApiService.eliminarAsignatura.and.returnValue(of({}));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AsignaturasComponent],
      imports: [HttpClientTestingModule, FormsModule],
      providers: [
        provideMockStore({ initialState }),
        { provide: ApiService, useValue: mockApiService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(AsignaturasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // --- TEST VISUAL: TABLA ---
  it('debería mostrar 2 filas si el Store tiene Matemáticas e Historia', () => {
    const dummyData = [
      { Id: 1, Clase: 'Matemáticas', Profesor: 'Newton' },
      { Id: 2, Clase: 'Historia', Profesor: 'Heródoto' }
    ];

    store.setState({
      asignaturas: { loading: false, asignaturas: dummyData, error: null }
    });
    fixture.detectChanges();

    const filas = fixture.debugElement.queryAll(By.css('tbody tr'));
    expect(filas.length).toBe(2);
    expect(filas[0].nativeElement.textContent).toContain('Matemáticas');
  });

  // --- TEST INTERACCIÓN: BORRAR ---
  it('debería llamar a eliminar(10) al pulsar el botón de borrar', () => {
    const dummyData = [{ Id: 10, Clase: 'Física', Profesor: 'Einstein' }];

    store.setState({
      asignaturas: { loading: false, asignaturas: dummyData, error: null }
    });
    fixture.detectChanges();

    spyOn(component, 'eliminar');
    spyOn(window, 'confirm').and.returnValue(true); // Decimos que SÍ al popup

    const btnBorrar = fixture.debugElement.query(By.css('.btn-borrar'));
    btnBorrar.nativeElement.click();

    expect(component.eliminar).toHaveBeenCalledWith(10);
  });
});