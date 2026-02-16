import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface DatoGrafica {
  name: string;
  value: number;
}

export interface DashboardStats {
  totalAlumnos: number;
  totalAsignaturas: number;
  edadMediaGlobal: number;
  alumnosPorAsignatura: { nombre: string, valor: number }[];
  distribucionEdades: { nombre: string, valor: number }[];
  notaMediaPorAsignatura: { nombre: string, valorDecimal: number }[];
  aprobadosVsSuspensos: { nombre: string, valor: number }[];
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private url = 'http://localhost:5141/api';

  constructor(private http: HttpClient) { }

  // --- ALUMNOS ---
  getAlumnos(): Observable<any[]> { return this.http.get<any[]>(`${this.url}/Alumnos`); }
  guardarAlumno(dato: any) { return this.http.post(`${this.url}/Alumnos`, dato); }
  editarAlumno(id: number, dato: any) { return this.http.put(`${this.url}/Alumnos/${id}`, dato); }
  eliminarAlumno(id: number) { return this.http.delete(`${this.url}/Alumnos/${id}`); }

  // --- ASIGNATURAS ---
  getAsignaturas(): Observable<any[]> { return this.http.get<any[]>(`${this.url}/Asignaturas`); }
  guardarAsignatura(dato: any) { return this.http.post(`${this.url}/Asignaturas`, dato); }
  editarAsignatura(id: number, dato: any) { return this.http.put(`${this.url}/Asignaturas/${id}`, dato); }
  eliminarAsignatura(id: number) { return this.http.delete(`${this.url}/Asignaturas/${id}`); }

  // --- PROFESORES ---
  getProfesores(): Observable<any[]> { return this.http.get<any[]>(`${this.url}/Profesores`); }
  crearProfesor(dato: any): Observable<any> { return this.http.post<any>(`${this.url}/Profesores`, dato); }
  editarProfesor(id: number, dato: any) { return this.http.put<any>(`${this.url}/Profesores/${id}`, dato); }
  eliminarProfesor(id: number) { return this.http.delete<any>(`${this.url}/Profesores/${id}`); }

  // --- NOTAS ---
  getNotas(): Observable<any[]> { return this.http.get<any[]>(`${this.url}/Notas`); }
  guardarNota(dato: any) { return this.http.post(`${this.url}/Notas`, dato); }
  editarNota(id: number, dato: any) { return this.http.put(`${this.url}/Notas/${id}`, dato); }
  eliminarNota(id: number) { return this.http.delete(`${this.url}/Notas/${id}`); }

  buscarNotas(texto: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/Notas/buscar?texto=${texto}`);
  }

  // --- MATRÍCULAS ---
  getMatriculas(): Observable<any[]> { return this.http.get<any[]>(`${this.url}/AsignaturaAlumnos`); }
  matricular(alumnoId: number, asignaturaId: number) { return this.http.post(`${this.url}/AsignaturaAlumnos`, { alumnoId: alumnoId, asignaturaId: asignaturaId }); }
  eliminarMatricula(id: number) { return this.http.delete(`${this.url}/AsignaturaAlumnos/${id}`); }
  editarMatricula(id: number, dato: any) { return this.http.put(`${this.url}/AsignaturaAlumnos/${id}`, dato); }

  // --- AUTENTICACIÓN ---
  login(credenciales: any): Observable<any> {
    return this.http.post<any>(`${this.url}/Auth/login`, credenciales).pipe(
      tap(respuesta => {
        if (respuesta && respuesta.token) {
          localStorage.setItem('token', respuesta.token);
        }
      })
    );
  }

  logout() { localStorage.removeItem('token'); }

  estaLogueado(): boolean { return !!localStorage.getItem('token'); }

  getRol(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      const datos = JSON.parse(atob(payload));
      return datos.role || datos['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || null;
    } catch (error) { return null; }
  }

  getDashboardRoute(): string {
    const rol = this.getRol();
    if (rol === 'Admin') return '/dashboard';
    if (rol === 'Profesor') return '/dashboard-profesor';
    if (rol === 'Alumno') return '/mi-perfil';
    return '/';
  }

  soyAdmin(): boolean { return this.getRol() === 'Admin'; }
  soyProfesor(): boolean { return this.getRol() === 'Profesor'; }
  soyAlumno(): boolean { return this.getRol() === 'Alumno'; }

  getUserName(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      const datos = JSON.parse(atob(payload));
      return datos.unique_name || datos.nameid || datos['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || null;
    } catch (error) { return null; }
  }

  // --- ESTADÍSTICAS ---
  getStats(): Observable<DashboardStats> {
    // Usamos any temporalmente en el get para evitar conflictos si el json viene en minúscula
    return this.http.get<any>(`${this.url}/Stats`);
  }

  getStatsAlumno(): Observable<any> { return this.http.get<any>(`${this.url}/Stats/alumno`); }
  getStatsProfesor(): Observable<any> { return this.http.get<any>(`${this.url}/Stats/profesor`); }
}
