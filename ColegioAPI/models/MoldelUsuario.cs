using System.ComponentModel.DataAnnotations;

namespace ColegioAPI.models
{
    public class User
    {
        public int Id { get; set; }
        public string NombreUsuario { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Rol { get; set; } = string.Empty;
    }
}