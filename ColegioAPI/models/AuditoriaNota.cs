using System;

namespace ColegioAPI.models
{
    public class AuditoriaNota
    {
        public int Id { get; set; }
        public int AsignaturaAlumnoId { get; set; } // Esto nos dice el alumno y la asignatura
        public double? NotaAntigua { get; set; }
        public double? NotaNueva { get; set; }
        public string Operacion { get; set; }
        public DateTime Fecha { get; set; }
    }
}