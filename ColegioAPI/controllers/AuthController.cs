using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ColegioAPI.Data;
using ColegioAPI.models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ColegioAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // REGISTRO
        [HttpPost("register")]
        public async Task<ActionResult<User>> Register(UserDto request)
        {
            string nombreNormalizado = Normalizar(request.Username);

            if (await _context.Usuarios.AnyAsync(u => u.NombreUsuario == nombreNormalizado))
            {
                return BadRequest("El usuario ya existe.");
            }

            string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var user = new User
            {
                NombreUsuario = nombreNormalizado,
                Password = passwordHash,
                Rol = request.Rol
            };

            _context.Usuarios.Add(user);
            await _context.SaveChangesAsync();

            return Ok(user);
        }

        // LOGIN
        [HttpPost("login")]
        public async Task<ActionResult<string>> Login(UserDto request)
        {
            string nombreNormalizado = Normalizar(request.Username);

            var user = await _context.Usuarios
                .FirstOrDefaultAsync(u => u.NombreUsuario == nombreNormalizado);

            if (user == null) return Unauthorized("Usuario no encontrado.");

            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
            {
                return Unauthorized("Contraseña incorrecta.");
            }

            return Ok(new { token = CrearToken(user) });
        }

        // MÉTODO PARA LIMPIEZA DE BBDD
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Usuarios.FindAsync(id);
            if (user == null)
            {
                return NotFound(new { mensaje = "Usuario no encontrado" });
            }

            _context.Usuarios.Remove(user);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = $"Usuario con ID {id} borrado correctamente" });
        }

        // MÉTODO PARA BORRADO MASIVO
        [HttpDelete("bulk-delete")]
        public async Task<IActionResult> BulkDelete([FromBody] List<int> ids)
        {
            if (ids == null || !ids.Any()) return BadRequest("No has mandado ningún ID");

            // Buscamos todos los usuarios cuyos IDs estén en la lista que mandamos
            var usuariosABorrar = await _context.Usuarios
                .Where(u => ids.Contains(u.Id))
                .ToListAsync();

            if (!usuariosABorrar.Any()) return NotFound("No se encontraron usuarios con esos IDs");

            _context.Usuarios.RemoveRange(usuariosABorrar);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = $"{usuariosABorrar.Count} usuarios borrados correctamente" });
        }

        // --- MÉTODOS PRIVADOS ---

        private string CrearToken(User user)
        {
            List<Claim> claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.NombreUsuario),
                new Claim(ClaimTypes.Role, user.Rol)
            };

            // Buscamos "JWT:Key" 
            var keyString = _configuration["JWT:Key"] ?? _configuration["Jwt:Key"];

            // Seguridad extra por si acaso sigue viniendo vacío
            if (string.IsNullOrEmpty(keyString))
            {
                throw new Exception("¡ERROR! La clave 'JWT:Key' no se encuentra en appsettings.json");
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

            var token = new JwtSecurityToken(
                    claims: claims,
                    expires: DateTime.Now.AddDays(1),
                    signingCredentials: creds
                );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private string Normalizar(string texto)
        {
            if (string.IsNullOrEmpty(texto)) return "";
            texto = texto.ToLowerInvariant();
            texto = texto.Replace("á", "a").Replace("é", "e").Replace("í", "i").Replace("ó", "o").Replace("ú", "u");
            texto = texto.Replace("Á", "a").Replace("É", "e").Replace("Í", "i").Replace("Ó", "o").Replace("Ú", "u");
            texto = texto.Replace("ñ", "n").Replace("Ñ", "n");
            return texto.Trim();
        }
    }

    public class UserDto
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Rol { get; set; } = "Alumno";
    }
}