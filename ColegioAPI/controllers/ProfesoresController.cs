using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ColegioAPI.Data;
using ColegioAPI.models;
using Microsoft.AspNetCore.Authorization;
using BCrypt.Net;
using System.Text;
using System.Globalization;

namespace ColegioAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProfesoresController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProfesoresController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Profesores
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Profesores>>> GetProfesores()
        {
            return await _context.Profesores.ToListAsync();
        }

        // GET: api/Profesores/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Profesores>> GetProfesores(int id)
        {
            var profesores = await _context.Profesores.FindAsync(id);
            if (profesores == null) return NotFound();
            return profesores;
        }

        // ==================================================================
        // POST: CREAR PROFESOR + USUARIO + ASIGNATURA (TODO EN UNO)
        // ==================================================================
        [HttpPost]
        public async Task<IActionResult> PostProfesores(ProfesorRegistroDTO datos)
        {
            // 1. Validar que venga la asignatura
            if (string.IsNullOrEmpty(datos.AsignaturaInicial))
            {
                return BadRequest("La asignatura inicial es obligatoria.");
            }

            // 2. Guardar el Profesor
            var nuevoProfesor = new Profesores
            {
                Id = 0,
                Nombre = datos.Nombre
            };
            _context.Profesores.Add(nuevoProfesor);
            await _context.SaveChangesAsync();

            // 3. Generar Usuario (nombre.apellido o nombre simple + id)
            string baseUser = Normalizar(datos.Nombre).Replace(" ", ".");
            string nombreUsuario = baseUser;

            // Evitar duplicados
            if (await _context.Usuarios.AnyAsync(u => u.NombreUsuario == nombreUsuario))
            {
                nombreUsuario = $"{baseUser}{nuevoProfesor.Id}";
            }

            string passwordPlana = "1234";
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(passwordPlana);

            var nuevoUsuario = new User
            {
                Id = 0,
                NombreUsuario = nombreUsuario,
                Password = passwordHash,
                Rol = "Profesor"
            };
            _context.Usuarios.Add(nuevoUsuario);

            // 4. CREAR LA ASIGNATURA VINCULADA AL USUARIO CREADO
            var nuevaAsignatura = new Asignaturas
            {
                Id = 0,
                Clase = datos.AsignaturaInicial,
                Profesor = nombreUsuario, // vinculamos al usuario generado
                AsignaturaAlumnos = new List<AsignaturaAlumno>()
            };
            _context.Asignaturas.Add(nuevaAsignatura);

            // 5. Guardar Usuario y Asignatura
            await _context.SaveChangesAsync();

            // 6. Retornar todo lo necesario para el Frontend
            return Ok(new
            {
                mensaje = "Profesor y Asignatura creados correctamente",
                usuario = nombreUsuario,
                passwordGenerada = passwordPlana,
                asignatura = nuevaAsignatura.Clase
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProfesores(int id)
        {
            var profesores = await _context.Profesores.FindAsync(id);
            if (profesores == null) return NotFound();

            _context.Profesores.Remove(profesores);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private string Normalizar(string texto)
        {
            if (string.IsNullOrEmpty(texto)) return "";
            var normalizedString = texto.Normalize(NormalizationForm.FormD);
            var stringBuilder = new StringBuilder();

            foreach (var c in normalizedString)
            {
                if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
                {
                    stringBuilder.Append(c);
                }
            }
            return stringBuilder.ToString().Normalize(NormalizationForm.FormC).ToLower().Trim();
        }
    }

    // DTO: Estructura de datos para recibir lo que envía el formulario de Angular
    public class ProfesorRegistroDTO
    {
        public string Nombre { get; set; }
        public string AsignaturaInicial { get; set; }
    }
}