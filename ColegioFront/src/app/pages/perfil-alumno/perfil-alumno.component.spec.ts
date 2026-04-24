import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PerfilAlumnoComponent } from './perfil-alumno.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';
<<<<<<< Updated upstream
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { fakeAsync, tick } from '@angular/core/testing';
=======
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import Swal from 'sweetalert2';
>>>>>>> Stashed changes

describe('PerfilAlumnoComponent', () => {
  let component: PerfilAlumnoComponent;
  let fixture: ComponentFixture<PerfilAlumnoComponent>;
  let store: MockStore;
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

  it('debería mostrar el promedio global del alumno', () => {
    const datosFalsos = {
      Aprobadas: 5, Suspensas: 1, PromedioGlobal: 8.75, TotalAsignaturas: 6, Asignaturas: [], StatsTarta: []
    };
    mockApiService.getStatsAlumno.and.returnValue(of(datosFalsos));
    component.cargarDatos();
    fixture.detectChanges();

    const tarjetaPromedio = fixture.debugElement.query(By.css('.card-kpi.blue .promedio-valor'));
    expect(tarjetaPromedio).toBeTruthy();
    expect(tarjetaPromedio.nativeElement.textContent).toContain('8.75');
  });
<<<<<<< Updated upstream
});
=======

  it('debería descargar el PDF y mostrar SweetAlert de éxito', fakeAsync(() => {
    const httpMock = TestBed.inject(HttpTestingController);
    component.nombreUsuario = 'Ignacio';
    spyOn(Swal, 'fire');

    // Mantenemos la creación del elemento para que Angular trabaje normal,
    // pero ANULAMOS la capacidad física de hacer click sobre ese elemento específico.
    const originalCreateElement = document.createElement.bind(document);
    spyOn(document, 'createElement').and.callFake((tagName: string) => {
      const el = originalCreateElement(tagName);
      if (tagName.toLowerCase() === 'a') {
        el.click = () => { }; // Neutraliza el motor interno de Chrome
      }
      return el;
    });

    spyOn(window.URL, 'createObjectURL').and.returnValue('blob:test');
    spyOn(window.URL, 'revokeObjectURL').and.stub();

    component.descargarPDF();

    const blob = new Blob(["contenido del pdf"], { type: 'application/pdf' });
    const req = httpMock.expectOne('http://localhost:5141/api/Notas/exportar-pdf');
    req.flush(blob);
    httpMock.verify();
    tick();

    expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({
      icon: 'success',
      title: 'PDF descargado correctamente',
      text: 'El PDF se ha descargado correctamente',
      confirmButtonText: 'Aceptar'
    }));
  }));

  it('debería mostrar SweetAlert de error si la descarga falla', fakeAsync(() => {
    const httpMock = TestBed.inject(HttpTestingController);
    component.nombreUsuario = 'Ignacio';
    spyOn(Swal, 'fire');

    component.descargarPDF();

    const req = httpMock.expectOne('http://localhost:5141/api/Notas/exportar-pdf');
    req.error(new ProgressEvent('Network error'));
    httpMock.verify();
    tick();

    expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({
      icon: 'error',
      title: 'Error al descargar el PDF',
      text: 'Por favor, intenta nuevamente',
      confirmButtonText: 'Aceptar'
    }));
  }));
});
>>>>>>> Stashed changes
