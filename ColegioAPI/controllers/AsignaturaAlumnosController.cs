using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ColegioAPI.Data;
using ColegioAPI.models;
using Microsoft.AspNetCore.Authorization;
using System.Text;
using System.Globalization;

namespace ColegioAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class AsignaturaAlumnosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AsignaturaAlumnosController(AppDbContext context)
        {
            _context = context;
        }

        // GET: Ver todas las matrículas
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<object>>> GetMatriculas()
        {
            // 1. Datos del usuario logueado
            var esProfesor = User.IsInRole("Profesor");
            var esAlumno = User.IsInRole("Alumno");
            var usuarioLogin = User.Identity?.Name; // Ej: "juanperez"

            // 2. Nombre Real del Token (para profesores)
            var identity = HttpContext.User.Identity as System.Security.Claims.ClaimsIdentity;
            var nombreReal = identity?.FindFirst("NombreReal")?.Value;

            // 3. Traemos TODO de la BD
            var todasLasMatriculas = await _context.Asignatura_Alumnos
                .Include(a => a.Alumno)
                .Include(a => a.Asignatura)
                .ToListAsync();

            // 4. FILTRADO EN MEMORIA
            IEnumerable<AsignaturaAlumno> resultados = todasLasMatriculas;

            if (esProfesor)
            {
                // El profesor ve las matrículas de SUS asignaturas
                string nombreBusqueda = !string.IsNullOrEmpty(nombreReal) ? nombreReal : usuarioLogin;

                resultados = todasLasMatriculas
                    .Where(m => Normalizar(m.Asignatura.Profesor) == Normalizar(nombreBusqueda));
            }
            else if (esAlumno)
            {
                // === CORRECCIÓN AQUÍ ===
                // El alumno ve sus propias matrículas.
                // Como 'Alumno' no tiene campo 'NombreUsuario', lo construimos al vuelo:
                resultados = todasLasMatriculas
                    .Where(m => Normalizar(m.Alumno.Nombre + " " + m.Alumno.Apellido) == usuarioLogin);
            }

            // 5. Devolver DTO
            return Ok(resultados.Select(m => new
            {
                Id = m.Id,
                AlumnoId = m.AlumnoId,
                AsignaturaId = m.AsignaturaId,
                Alumno = m.Alumno.Nombre + " " + m.Alumno.Apellido,
                Asignatura = m.Asignatura.Clase,
                Año = m.AñoEscolar
            }));
        }

        // POST: Matricular
        [HttpPost]
        [Authorize(Roles = "Admin,Profesor,Alumno")]
        public async Task<ActionResult<object>> Matricular(MatriculaDTO datos)
        {
            if (datos.AlumnoId <= 0 || datos.AsignaturaId <= 0)
                return BadRequest("Datos inválidos.");

            var existe = await _context.Asignatura_Alumnos
                .AnyAsync(x => x.AlumnoId == datos.AlumnoId && x.AsignaturaId == datos.AsignaturaId);

            if (existe) return BadRequest("El alumno ya está matriculado en esta asignatura.");

            var nuevaMatricula = new AsignaturaAlumno
            {
                AlumnoId = datos.AlumnoId,
                AsignaturaId = datos.AsignaturaId,
                AñoEscolar = DateTime.Now.Year,
                FechaMatricula = DateTime.UtcNow
            };

            _context.Asignatura_Alumnos.Add(nuevaMatricula);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Matriculado correctamente", id = nuevaMatricula.Id });
        }

        // DELETE: Desmatricular
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Profesor, Alumno")]
        public async Task<IActionResult> Desmatricular(int id)
        {
            var matricula = await _context.Asignatura_Alumnos.FindAsync(id);
            if (matricula == null) return NotFound();

            _context.Asignatura_Alumnos.Remove(matricula);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DTO para recibir datos del POST
        public class MatriculaDTO
        {
            public int AlumnoId { get; set; }
            public int AsignaturaId { get; set; }
        }

        // UTILIDAD: Normalizar texto (quita tildes y espacios)
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

            // Devuelve: "josegarcia" (sin espacios, minúsculas, sin tildes)
            return stringBuilder.ToString().Normalize(NormalizationForm.FormC)
                .ToLower().Replace(" ", "").Trim();
        }
    }
}