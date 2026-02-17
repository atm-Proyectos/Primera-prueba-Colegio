using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ColegioAPI.models
{
    public class AsignaturaAlumno
    {
        public int Id { get; set; }

        [Required]
        public int AlumnoId { get; set; }
        [ForeignKey("AlumnoId")]
        public Alumnos? Alumno { get; set; }

        [Required]
        public int AsignaturaId { get; set; }
        [ForeignKey("AsignaturaId")]
        public Asignaturas? Asignatura { get; set; }

        public Notas? Notas { get; set; }

        public int AñoEscolar { get; set; }
        public DateTime FechaMatricula { get; set; }
    }
}