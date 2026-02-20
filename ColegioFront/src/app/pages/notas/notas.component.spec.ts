import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotasComponent } from './notas.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('NotasComponent', () => {
  let component: NotasComponent;
  let fixture: ComponentFixture<NotasComponent>;
  let store: MockStore;
  const initialState = { notas: { notas: [], loading: false, error: null } };

  // 1. MOCK SERVICIO
  const mockApiService = jasmine.createSpyObj('ApiService', [
    'getNotas',
    'getAlumnos',
    'getAsignaturas',
    'getMatriculas',
    'guardarNota',
    'editarNota',
    'eliminarNota',
    'soyProfesor',
    'soyAdmin',
    'soyAlumno',
    'getUserName'
  ]);

  // Respuestas predeterminadas para evitar errores de carga inicial
  mockApiService.soyProfesor.and.returnValue(true);
  mockApiService.soyAdmin.and.returnValue(false);
  mockApiService.soyAlumno.and.returnValue(false);
  mockApiService.getUserName.and.returnValue('Ignacio');
  mockApiService.getNotas.and.returnValue(of([]));
  mockApiService.getAlumnos.and.returnValue(of([]));
  mockApiService.getAsignaturas.and.returnValue(of([]));
  mockApiService.getMatriculas.and.returnValue(of([]));
  mockApiService.guardarNota.and.returnValue(of({}));
  mockApiService.eliminarNota.and.returnValue(of({}));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NotasComponent],
      imports: [HttpClientTestingModule, FormsModule],
      providers: [
        provideMockStore({ initialState }),
        { provide: ApiService, useValue: mockApiService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(NotasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // --- TEST VISUAL COMPLETO (VERDE Y ROJO) ---
  it('debería pintar el texto en VERDE si la nota es >= 5 y ROJO si es < 5', async () => {
    const dummyNotas = [
      { Id: 1, Valor: 8.5, NombreAlumn: 'Alumno A', NombreAsignatura: 'Mates' },
      { Id: 2, Valor: 3.0, NombreAlumn: 'Alumno B', NombreAsignatura: 'Mates' }
    ];

    store.setState({ notas: { loading: false, notas: dummyNotas, error: null } });

    // Sincronización de renderizado
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const filas = fixture.debugElement.queryAll(By.css('.badge-nota'));

    // ✅ Verificamos color exacto que Chrome renderiza para tus clases CSS
    expect(window.getComputedStyle(filas[0].nativeElement).color).toBe('rgb(21, 87, 36)');
    expect(window.getComputedStyle(filas[1].nativeElement).color).toBe('rgb(114, 28, 36)');
  });

  // --- TEST INTERACCIÓN BORRADO ---
  it('debería intentar borrar la nota 99 al pulsar el botón', async () => {
    const dummyNotas = [{ Id: 99, Valor: 10, NombreAlumno: 'Carlos', NombreAsignatura: 'Tecnologia' }];

    // ✅ Roles en booleano para que el HTML muestre el botón
    mockApiService.soyProfesor.and.returnValue(true);
    mockApiService.soyAlumno.and.returnValue(false);

    store.setState({ notas: { notas: dummyNotas, loading: false, error: null } });

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    spyOn(component, 'eliminar');
    spyOn(window, 'confirm').and.returnValue(true);

    const btnEliminar = fixture.debugElement.query(By.css('.btn-eliminar'));
    expect(btnEliminar).toBeTruthy();
    btnEliminar.nativeElement.click();

    expect(component.eliminar).toHaveBeenCalledWith(99);
  });
});