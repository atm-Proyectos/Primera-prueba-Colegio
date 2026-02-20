using System.ComponentModel.DataAnnotations;

namespace ColegioAPI.models
{
    public class User
    {
        public required int Id { get; set; }
        public required string NombreUsuario { get; set; } = string.Empty;
        public required string Password { get; set; } = string.Empty;
        public required string Rol { get; set; } = string.Empty;
    }
}