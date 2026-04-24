using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ColegioAPI.models
{
    public class Notas
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "El valor es obligatorio")]
        [Range(0, 10, ErrorMessage = "El valor debe estar entre 0 y 10")]
        public decimal Valor { get; set; }

        [Required]
        public int AsignaturaAlumnoId { get; set; }
        [ForeignKey("AsignaturaAlumnoId")]
        public AsignaturaAlumno? AsignaturaAlumno { get; set; }
    }
}