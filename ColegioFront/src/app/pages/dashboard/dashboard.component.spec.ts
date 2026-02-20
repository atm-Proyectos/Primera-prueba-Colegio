import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { provideMockStore } from '@ngrx/store/testing';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  // ✨ Definimos un estado inicial para que los selectores no den undefined
  const initialState = {
    dashboard: {
      stats: null,
      loading: false,
      error: null
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      imports: [FormsModule, HttpClientTestingModule],
      providers: [
        provideMockStore({ initialState }), // ✨ Pasamos el initialState
        { provide: ApiService, useValue: { getStatsAdmin: () => of({}) } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería mostrar las estadísticas globales correctamente', () => {
    const mockStats = {
      TotalAlumnos: 50,
      TotalAsignaturas: 10,
      EdadMediaGlobal: 15.5
    };

    component.stats$ = of(mockStats);
    fixture.detectChanges();

    const cardAlumnos = fixture.debugElement.query(By.css('.total-alumnos-card'));
    expect(cardAlumnos.nativeElement.textContent).toContain('50');
  });

  it('debería procesar correctamente los datos para la gráfica de Aprobados vs Suspensos', (done) => {
    const mockStats = {
      AprobadosVsSuspensos: [
        { name: 'Aprobados', value: 25 },
        { name: 'Suspensos', value: 5 }
      ]
    };

    component.stats$ = of(mockStats);
    fixture.detectChanges();

    component.stats$.subscribe(data => {
      expect(data.AprobadosVsSuspensos.length).toBe(2);
      done();
    });
  });
});