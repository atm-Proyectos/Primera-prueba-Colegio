import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotasComponent } from './notas.component';
import { provideMockStore } from '@ngrx/store/testing';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { of } from 'rxjs';
import { SpinnerComponent } from 'src/app/components/spinner/spinner.component';

describe('NotasComponent', () => {
  let component: NotasComponent;
  let fixture: ComponentFixture<NotasComponent>;

  const mockApiService = jasmine.createSpyObj('ApiService', [
    'getNotas',
    'getAlumnos',
    'getMatriculas',
    'guardarNota',
    'editarNota',
    'eliminarNota'
  ]);

  mockApiService.getNotas.and.returnValue(of([]));
  mockApiService.getAlumnos.and.returnValue(of([]));
  mockApiService.getMatriculas.and.returnValue(of([]));
  mockApiService.guardarNota.and.returnValue(of({}));
  mockApiService.editarNota.and.returnValue(of({}));
  mockApiService.eliminarNota.and.returnValue(of({}));

  const initialState = {
    notas: { loading: false, notas: [], error: null }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NotasComponent, SpinnerComponent],
      imports: [FormsModule],
      providers: [
        provideMockStore({ initialState }),
        { provide: ApiService, useValue: mockApiService }
      ]
    });
    fixture = TestBed.createComponent(NotasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});