using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ColegioAPI.models
{
    public class Alumnos
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "El nombre es obligatorio")]
        [MaxLength(50, ErrorMessage = "El nombre debe tener menos de 50 caracteres")]
        [MinLength(2, ErrorMessage = "El nombre debe tener al menos 2 caracteres")]
        public string Nombre { get; set; } = string.Empty;

        [Required(ErrorMessage = "El apellido es obligatorio")]
        [MaxLength(50, ErrorMessage = "El apellido debe tener menos de 50 caracteres")]
        [MinLength(2, ErrorMessage = "El apellido debe tener al menos 2 caracteres")]
        public string Apellido { get; set; } = string.Empty;

        [Required(ErrorMessage = "La edad es obligatoria")]
        [Range(3, 19, ErrorMessage = "La edad debe estar entre 3 y 19")]
        public int Edad { get; set; }

        // Relación
        [JsonIgnore]
        public required List<AsignaturaAlumno>? AsignaturaAlumnos { get; set; }
    }
}