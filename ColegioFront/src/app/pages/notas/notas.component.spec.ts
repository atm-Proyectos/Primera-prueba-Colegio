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
    'getMatriculas',
    'guardarNota',
    'editarNota',
    'eliminarNota'
  ]);

  // Respuestas vacías para evitar errores al cargar
  mockApiService.getNotas.and.returnValue(of([]));
  mockApiService.getAlumnos.and.returnValue(of([]));
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

  // --- TEST VISUAL + LÓGICA DE COLOR ---
  it('debería pintar el texto en VERDE si la nota es >= 5 y ROJO si es < 5', () => {
    const dummyNotas = [
      { id: 1, valor: 8.5, nombreAlumno: 'Aprobado', nombreAsignatura: 'Mates', alumnoId: 1, asignaturaId: 1 },
      { id: 2, valor: 3.0, nombreAlumno: 'Suspenso', nombreAsignatura: 'Mates', alumnoId: 2, asignaturaId: 1 }
    ];

    store.setState({
      notas: { loading: false, notas: dummyNotas, error: null }
    });
    fixture.detectChanges();

    const filas = fixture.debugElement.queryAll(By.css('tbody tr'));

    // Fila 1: Aprobado (Debe ser verde)
    // Buscamos la 3ra celda (td) que es la de la nota
    const celdaNotaAprobada = filas[0].queryAll(By.css('td'))[2].nativeElement;
    expect(celdaNotaAprobada.style.color).toBe('green');

    // Fila 2: Suspenso (Debe ser rojo)
    const celdaNotaSuspensa = filas[1].queryAll(By.css('td'))[2].nativeElement;
    expect(celdaNotaSuspensa.style.color).toBe('red');
  });

  // --- TEST INTERACCIÓN ---
  it('debería intentar borrar la nota 99 al pulsar el botón', () => {
    const dummyNotas = [
      { id: 99, valor: 10, nombreAlumno: 'Crack', nombreAsignatura: 'Todo', alumnoId: 1, asignaturaId: 1 }
    ];

    store.setState({ notas: { notas: dummyNotas, loading: false, error: null } });
    fixture.detectChanges();

    spyOn(component, 'eliminar');
    spyOn(window, 'confirm').and.returnValue(true);

    const btnBorrar = fixture.debugElement.query(By.css('.btn-borrar'));
    btnBorrar.nativeElement.click();

    expect(component.eliminar).toHaveBeenCalledWith(99);
  });
});