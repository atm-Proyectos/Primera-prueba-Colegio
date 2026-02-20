using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ColegioAPI.models
{
    public class AsignaturaAlumno
    {
        public required int Id { get; set; }

        [Required]
        public required int AlumnoId { get; set; }
        [ForeignKey("AlumnoId")]
        public Alumnos? Alumno { get; set; }

        [Required]
        public required int AsignaturaId { get; set; }
        [ForeignKey("AsignaturaId")]
        public Asignaturas? Asignatura { get; set; }

        public Notas? Notas { get; set; }

        public required int AñoEscolar { get; set; }
        public required DateTime FechaMatricula { get; set; }
    }
}