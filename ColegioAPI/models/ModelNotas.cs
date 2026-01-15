using System.ComponentModel.DataAnnotations;

namespace ColegioAPI.models
{
    public class Notas
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "El valor es obligatorio")]
        [Range(0, 10, ErrorMessage = "El valor debe estar entre 0 y 10")]
        public decimal Valor { get; set; }

        [Required(ErrorMessage = "El alumno es obligatorio")]
        public int AlumnoId { get; set; }
        public Alumnos? Alumno { get; set; }

        [Required(ErrorMessage = "La asignatura es obligatoria")]
        public int AsignaturaId { get; set; }
        public Asignaturas? Asignatura { get; set; }
    }
}