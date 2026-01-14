namespace ColegioAPI.models
{
    public class Notas
    {
        public int Id { get; set; }
        public decimal Valor { get; set; }

        public int AlumnoId { get; set; }
        public Alumnos? Alumno { get; set; }

        public int AsignaturaId { get; set; }
        public Asignaturas? Asignatura { get; set; }
    }
}