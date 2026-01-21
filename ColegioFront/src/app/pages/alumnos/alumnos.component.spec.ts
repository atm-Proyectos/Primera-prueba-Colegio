import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlumnosComponent } from './alumnos.component';
import { provideMockStore } from '@ngrx/store/testing';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { of } from 'rxjs';

describe('AlumnosComponent', () => {
  let component: AlumnosComponent;
  let fixture: ComponentFixture<AlumnosComponent>;

  const mockApiService = jasmine.createSpyObj('ApiService', [
    'getMatriculas',
    'getAsignaturas',
    'guardarAlumno',
    'editarAlumno',
    'eliminarAlumno',
    'matricular',
    'desmatricular'
  ]);

  mockApiService.getMatriculas.and.returnValue(of([]));
  mockApiService.getAsignaturas.and.returnValue(of([]));
  mockApiService.guardarAlumno.and.returnValue(of({}));
  mockApiService.editarAlumno.and.returnValue(of({}));
  mockApiService.eliminarAlumno.and.returnValue(of({}));
  mockApiService.matricular.and.returnValue(of({}));
  mockApiService.desmatricular.and.returnValue(of({}));

  const initialState = {
    alumnos: { loading: false, alumnos: [], error: null }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AlumnosComponent],
      imports: [FormsModule],
      providers: [
        provideMockStore({ initialState }),
        { provide: ApiService, useValue: mockApiService }
      ]
    });
    fixture = TestBed.createComponent(AlumnosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});