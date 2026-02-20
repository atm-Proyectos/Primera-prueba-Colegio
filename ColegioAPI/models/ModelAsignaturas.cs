using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ColegioAPI.models
{
    public class Asignaturas
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Clase { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Profesor { get; set; } = string.Empty;

        [JsonIgnore]
        public required List<AsignaturaAlumno>? AsignaturaAlumnos { get; set; }
    }
}