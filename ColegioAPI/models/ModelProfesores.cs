using System.ComponentModel.DataAnnotations;

namespace ColegioAPI.models
{
    public class Profesores
    {
        public int Id { get; set; }

        [Required]
        public string Nombre { get; set; } = string.Empty;
    }
}