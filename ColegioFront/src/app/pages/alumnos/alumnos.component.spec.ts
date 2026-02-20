import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlumnosComponent } from './alumnos.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { of } from 'rxjs'; // Necesario para devolver datos falsos
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AlumnosComponent', () => {
  let component: AlumnosComponent;
  let fixture: ComponentFixture<AlumnosComponent>;
  let store: MockStore;
  const initialState = { alumnos: { alumnos: [], loading: false, error: null } };

  const mockApiService = jasmine.createSpyObj('ApiService', [
    'getAlumnos',
    'getAsignaturas',
    'getMatriculas',
    'guardarAlumno',
    'editarAlumno',
    'eliminarAlumno',
    'matricular',
    'desmatricular',
    'soyProfesor',
    'soyAdmin',
    'soyAlumno',
    'getUserName'
  ]);

  mockApiService.getAlumnos.and.returnValue(of([]));
  mockApiService.getAsignaturas.and.returnValue(of([]));
  mockApiService.getMatriculas.and.returnValue(of([]));
  mockApiService.guardarAlumno.and.returnValue(of({}));
  mockApiService.editarAlumno.and.returnValue(of({}));
  mockApiService.eliminarAlumno.and.returnValue(of({}));
  mockApiService.matricular.and.returnValue(of({}));
  mockApiService.desmatricular.and.returnValue(of({}));
  mockApiService.soyProfesor.and.returnValue(of(false));
  mockApiService.soyAdmin.and.returnValue(of(true));
  mockApiService.soyAlumno.and.returnValue(of(false));
  mockApiService.getUserName.and.returnValue('Ignacio');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AlumnosComponent],
      imports: [HttpClientTestingModule, FormsModule],
      providers: [
        provideMockStore({ initialState }),
        { provide: ApiService, useValue: mockApiService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(AlumnosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // --- TEST 1: Creación básica ---
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // --- TEST 2: Visual (Tabla) ---
  it('debería mostrar una tabla con 2 alumnos cuando el Store tiene datos', () => {
    const dummyAlumnos = [
      { Id: 1, Nombre: 'Ignacio', Apellido: 'Garcia', Edad: 25 },
      { Id: 2, Nombre: 'Maria', Apellido: 'Lopez', Edad: 22 }
    ];

    store.setState({
      alumnos: {
        loading: false,
        alumnos: dummyAlumnos,
        error: null
      }
    });

    fixture.detectChanges();

    const filas = fixture.debugElement.queryAll(By.css('tbody tr'));

    expect(filas.length).toBe(2);

    const primeraFilaTexto = filas[0].nativeElement.textContent;
    expect(primeraFilaTexto).toContain('Ignacio');
    expect(primeraFilaTexto).toContain('Garcia');
  });

  // --- TEST 3: Interacción (Click Borrar) ---
  it('debería llamar a la función eliminar() al hacer click en el botón de borrar', () => {
    const unAlumno = [{ Id: 1, Nombre: 'Ignacio', Apellido: 'Garcia', Edad: 25 }];

    store.setState({
      alumnos: { alumnos: unAlumno, loading: false, error: null }
    });
    fixture.detectChanges();

    spyOn(component, 'eliminar');

    spyOn(window, 'confirm').and.returnValue(true);

    const botonBorrar = fixture.debugElement.query(By.css('.btn-borrar'));
    botonBorrar.nativeElement.click();

    expect(component.eliminar).toHaveBeenCalledWith(1);
  });

  // --- MODAL Y MATRICULACIÓN ---
  // Busca el test de matriculación y cámbialo por este:
  it('debería abrir el modal, seleccionar asignatura y matricular', () => {
    // ✅ Unificado a Id (Mayúscula)
    const alumno = { Id: 1, Nombre: 'Marcos', Apellido: 'Garcia', Edad: 11 };
    const asignatura = { Id: 99, Clase: 'Matemáticas', Profesor: 'Juan' };

    component.listaAsignaturas = [asignatura];
    component.listaMatriculas = [];

    component.abrirMatriculas(alumno);
    fixture.detectChanges();

    const modal = fixture.debugElement.query(By.css('.modal-overlay'));
    expect(modal).toBeTruthy();

    component.asignaturaParaMatricular = 99;
    fixture.detectChanges();

    const btnAdd = modal.query(By.css('.btn-guardar'));
    btnAdd.nativeElement.click();

    // ✅ El espía ahora recibirá (1, 99) en lugar de (undefined, 99)
    expect(mockApiService.matricular).toHaveBeenCalledWith(1, 99);
  });

});