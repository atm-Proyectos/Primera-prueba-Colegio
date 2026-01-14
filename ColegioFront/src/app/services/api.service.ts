import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  
  // BUSCADOR GLOBAL
  buscarNotas(texto: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/Notas/buscar?texto=${texto}`);
  }
}