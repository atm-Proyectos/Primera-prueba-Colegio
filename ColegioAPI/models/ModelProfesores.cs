using System.ComponentModel.DataAnnotations;

namespace ColegioAPI.models
{
    public class Profesores
    {
        public required int Id { get; set; }

        [Required]
        public required string Nombre { get; set; } = string.Empty;
    }
}