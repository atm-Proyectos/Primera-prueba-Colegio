import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';

describe('ApiService (Tests de Robustez)', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería devolver el nombre del usuario si hay un token válido', () => {
    // 1. Arrange (Organizar)
    // Inventamos un token falso (un JWT simplificado)
    const tokenFalso = 'header.' + btoa(JSON.stringify({ unique_name: 'Pablo Lopez' })) + '.signature';

    // Creamos el espía: Cuando se llame a getItem('token'), devolverá nuestro tokenFalso
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      return key === 'token' ? tokenFalso : null;
    });

    // 2. Act (Actuar)
    const resultado = service.getUserName();

    // 3. Assert (Afirmar)
    expect(resultado).toBe('Pablo Lopez');
  });

  it('✅ Debería crearse el servicio correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('🔥 Debería manejar correctamente un Error 500 del Servidor', () => {
    const mensajeError = 'Error Interno Fatal';

    service.getAlumnos().subscribe({
      next: () => fail('La petición debería haber fallado, no tenido éxito'),
      error: (error) => {
        expect(error.status).toBe(500);
        expect(error.statusText).toBe('Server Error');
      }
    });

    const req = httpMock.expectOne('http://localhost:5141/api/Alumnos');
    expect(req.request.method).toBe('GET');

    req.flush(mensajeError, { status: 500, statusText: 'Server Error' });
  });
});