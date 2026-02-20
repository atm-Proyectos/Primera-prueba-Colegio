import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ApiService } from 'src/app/services/api.service';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let router: Router;
  let navigateSpy: jasmine.Spy; // ✨ Definimos el espía aquí arriba

  // 1. Mock completo del servicio
  const mockApiService = jasmine.createSpyObj('ApiService', ['login', 'setToken', 'getRol']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([]) // Rutas vacías para evitar errores de navegación
      ],
      providers: [
        { provide: ApiService, useValue: mockApiService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);

    // ✨ ESPÍA ÚNICO: Lo creamos una sola vez aquí para evitar el error de "already spied upon"
    navigateSpy = spyOn(router, 'navigate').and.stub();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // --- TEST DE LÓGICA ---
  it('debería llamar al servicio de login y redirigir según el rol', () => {
    // Configuramos las respuestas del mock
    mockApiService.login.and.returnValue(of({ token: 'fake-jwt-token' }));
    mockApiService.getRol.and.returnValue('Admin');

    component.usuario = 'admin';
    component.password = '123456';

    // Ejecutamos la acción
    component.ingresar();

    // Verificamos las llamadas
    expect(mockApiService.login).toHaveBeenCalled();
    // ✅ Usamos el espía único que definimos en el beforeEach
    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
  });
});