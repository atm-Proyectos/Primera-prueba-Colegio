import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

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

  // --- NOTAS ---
  getNotas(): Observable<any[]> { return this.http.get<any[]>(`${this.url}/Notas`); }
  guardarNota(dato: any) { return this.http.post(`${this.url}/Notas`, dato); }
  editarNota(id: number, dato: any) { return this.http.put(`${this.url}/Notas/${id}`, dato); }
  eliminarNota(id: number) { return this.http.delete(`${this.url}/Notas/${id}`); }

  buscarNotas(texto: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/Notas/buscar?texto=${texto}`);
  }

  // --- MATRICULAS ---
  getMatriculas() {
    return this.http.get<any[]>(`${this.url}/AsignaturaAlumnos`);
  }

  matricular(alumnoId: number, asignaturaId: number) {
    const body = {
      AlumnoId: alumnoId,
      AsignaturaId: asignaturaId
    };

    return this.http.post(`${this.url}/AsignaturaAlumnos`, body);
  }

  eliminarMatricula(id: number) {
    return this.http.delete(`${this.url}/AsignaturaAlumnos/${id}`);
  }

  // --- DASHBOARD ---
  getStats() {
    return this.http.get<DashboardStats>(`${this.url}/Stats`);
  }

  // LOGIN
  login(credenciales: any) {
    return this.http.post<any>(`${this.url}/Auth/login`, credenciales).pipe(
      tap(respuesta => {
        if (respuesta && respuesta.token) {
          localStorage.setItem('token', respuesta.token);
        }
      })
    );
  }

  // MÉTODO PARA CERRAR SESIÓN (LOGOUT)
  logout() {
    localStorage.removeItem('token');
  }

  // MÉTODO PARA SABER SI ESTAMOS LOGUEADOS
  estaLogueado(): boolean {
    return !!localStorage.getItem('token');
  }

  // Obtener rol crudo del token
  getRol(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      const datos = JSON.parse(atob(payload));
      // Buscamos el rol en las claves típicas
      return datos.role || datos['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || null;
    } catch (error) {
      return null;
    }
  }

  // --- PREGUNTAS CLAVE ---

  soyAdmin(): boolean {
    return this.getRol() === 'Admin';
  }

  soyProfesor(): boolean {
    return this.getRol() === 'Profesor';
  }

  soyAlumno(): boolean {
    return this.getRol() === 'Alumno';
  }

  getUserName(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.unique_name || payload.name || 'Usuario';
    } catch {
      return null;
    }
  }

}