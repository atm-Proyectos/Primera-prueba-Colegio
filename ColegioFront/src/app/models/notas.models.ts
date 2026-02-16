export interface Notas {
    id: number;
    valor: number;
    asignaturaAlumnoId: number;
    alumno?: string;
    asignatura?: string;
    nombreAlumno?: string;
    nombreAsignatura?: string;
}