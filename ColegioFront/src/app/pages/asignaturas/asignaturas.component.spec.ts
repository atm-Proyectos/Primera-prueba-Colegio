import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AsignaturasComponent } from './asignaturas.component';
import { provideMockStore } from '@ngrx/store/testing';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { of } from 'rxjs';

describe('AsignaturasComponent', () => {
  let component: AsignaturasComponent;
  let fixture: ComponentFixture<AsignaturasComponent>;

  const mockApiService = jasmine.createSpyObj('ApiService', [
    'guardarAsignatura',
    'editarAsignatura',
    'eliminarAsignatura'
  ]);

  mockApiService.guardarAsignatura.and.returnValue(of({}));
  mockApiService.editarAsignatura.and.returnValue(of({}));
  mockApiService.eliminarAsignatura.and.returnValue(of({}));

  const initialState = {
    asignaturas: { loading: false, asignaturas: [], error: null }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AsignaturasComponent],
      imports: [FormsModule],
      providers: [
        provideMockStore({ initialState }),
        { provide: ApiService, useValue: mockApiService }
      ]
    });
    fixture = TestBed.createComponent(AsignaturasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});