using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ColegioAPI.Data;   // Necesario para acceder a la BD
using ColegioAPI.models; // Necesario para el modelo Usuario
using Microsoft.EntityFrameworkCore; // Necesario para usar .FirstOrDefaultAsync

namespace ColegioAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly AppDbContext _context; // Referencia a la BD

        public AuthController(IConfiguration config, AppDbContext context)
        {
            _config = config;
            _context = context;
        }

        // POST: api/Auth/register
        // Usaremos esto una vez para crear al usuario Admin
        [HttpPost("register")]
        public async Task<IActionResult> Registrar([FromBody] Usuario usuario)
        {
            // Validar si ya existe
            /* if (await _context.Usuarios.AnyAsync(u => u.NombreUsuario == usuario.NombreUsuario))
                 return BadRequest("El usuario ya existe."); */

            // Forzamos rol user si viene vacío, o admin si quieres probar
            if (string.IsNullOrEmpty(usuario.Rol)) usuario.Rol = "User";

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Usuario registrado con éxito" });
        }

        // POST: api/Auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest login)
        {
            // 1. BUSCAR EN BASE DE DATOS REAL
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.NombreUsuario == login.Username && u.Password == login.Password);

            // 2. Si no existe, error
            if (usuario == null)
            {
                return Unauthorized("Usuario o contraseña incorrectos");
            }

            // 3. Generar token con sus datos reales
            var token = GenerarToken(usuario.NombreUsuario, usuario.Rol);
            return Ok(new { token = token });
        }

        private string GenerarToken(string nombreUsuario, string rol)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.Name, nombreUsuario),
                new Claim(ClaimTypes.Role, rol)
            };

            var token = new JwtSecurityToken(
                _config["Jwt:Issuer"],
                _config["Jwt:Audience"],
                claims,
                expires: DateTime.Now.AddHours(2),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public class LoginRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }
}