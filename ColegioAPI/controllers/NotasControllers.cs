using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ColegioAPI.Data;
using ColegioAPI.models;
using Microsoft.AspNetCore.Authorization;

namespace ColegioAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class NotasController : ControllerBase
    {
        // 1. VARIABLE DE CONTEXTO
        private readonly AppDbContext _context;

        // 2. CONSTRUCTOR
        public NotasController(AppDbContext context)
        {
            _context = context;
        }

        //  MÉTODO BUSCADOR
        [HttpGet("buscar")]
        public async Task<ActionResult<IEnumerable<object>>> BuscarNotas(string? texto)
        {
            if (string.IsNullOrEmpty(texto))
            {
                // Si no hay texto, devolvemos las últimas 20 notas
                return await _context.Notas
                    .Include(n => n.AsignaturaAlumno)
                    .Include(n => n.AsignaturaAlumno.Asignatura)
                    .Take(20)
                    .Select(n => new
                    {
                        Id = n.Id,
                        NombreAlumno = n.AsignaturaAlumno.Alumno.Nombre + " " + n.AsignaturaAlumno.Alumno.Apellido,
                        NombreAsignatura = n.AsignaturaAlumno.Asignatura.Clase,
                        Profesor = n.AsignaturaAlumno.Asignatura.Profesor,
                        Valor = n.Valor
                    })
                    .ToListAsync();
            }

            var resultados = await _context.Notas
                .Include(n => n.AsignaturaAlumno)
                .Include(n => n.AsignaturaAlumno.Asignatura)
                .Where(n =>
                    n.AsignaturaAlumno.Alumno.Nombre.ToLower().Contains(texto.ToLower()) ||
                    n.AsignaturaAlumno.Alumno.Apellido.ToLower().Contains(texto.ToLower()) ||
                    n.AsignaturaAlumno.Asignatura.Clase.ToLower().Contains(texto.ToLower()) ||
                    n.Valor.ToString().Contains(texto)
                 )
                .Select(n => new
                {
                    Id = n.Id,
                    NombreAlumno = n.AsignaturaAlumno.Alumno.Nombre + " " + n.AsignaturaAlumno.Alumno.Apellido,
                    NombreAsignatura = n.AsignaturaAlumno.Asignatura.Clase,
                    Profesor = n.AsignaturaAlumno.Asignatura.Profesor,
                    Valor = n.Valor
                })
                .ToListAsync();

            return Ok(resultados);
        }

        //  MÉTODOS BÁSICOS (CRUD)

        // GET
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetNotas()
        {
            var usuario = User.Identity?.Name;
            var esProfesor = User.IsInRole("Profesor");
            var esAlumno = User.IsInRole("Alumno");
            var esAdmin = User.IsInRole("Admin");

            // Empezamos con todas las notas e incluimos relaciones
            var query = _context.Notas
                .Include(n => n.AsignaturaAlumno.Alumno)
                .Include(n => n.AsignaturaAlumno.Asignatura)
                .AsQueryable();

            // Solo notas de asignaturas que imparta EL
            if (esProfesor)
            {
                query = query.Where(n => EF.Functions.ILike(n.AsignaturaAlumno.Asignatura.Profesor, usuario));
            }
            // En NotasController.cs -> GetNotas()
            else if (esAlumno)
            {
                // 1. Cargamos TODO incluyendo al alumno y asignatura de forma explícita
                var todasLasNotas = await _context.Notas
                    .Include(n => n.AsignaturaAlumno)
                        .ThenInclude(aa => aa.Alumno)
                    .Include(n => n.AsignaturaAlumno)
                        .ThenInclude(aa => aa.Asignatura)
                    .ToListAsync();

                // 2. Filtramos comparando el nombre normalizado contra el usuario del Token
                var notasFiltradas = todasLasNotas
                    .Where(n => n.AsignaturaAlumno?.Alumno != null &&
                           Normalizar($"{n.AsignaturaAlumno.Alumno.Nombre} {n.AsignaturaAlumno.Alumno.Apellido}") == Normalizar(usuario))
                    .Select(n => new
                    {
                        Id = n.Id,
                        Valor = n.Valor,
                        NombreAlumno = $"{n.AsignaturaAlumno!.Alumno!.Nombre} {n.AsignaturaAlumno.Alumno.Apellido}",
                        NombreAsignatura = n.AsignaturaAlumno.Asignatura?.Clase ?? "Asignatura",
                        AsignaturaAlumnoId = n.AsignaturaAlumnoId
                    }).ToList();

                return Ok(notasFiltradas);
            }

            // Proyección de datos (Select)
            var resultado = await query.Select(n => new
            {
                Id = n.Id,
                Valor = n.Valor,
                NombreAlumno = n.AsignaturaAlumno.Alumno.Nombre + " " + n.AsignaturaAlumno.Alumno.Apellido,
                NombreAsignatura = n.AsignaturaAlumno.Asignatura.Clase,
                AsignaturaAlumnoId = n.AsignaturaAlumnoId
            }).ToListAsync();

            return Ok(resultado);
        }

        [HttpGet("mis-alumnos")]
        [Authorize(Roles = "Profesor")]
        public async Task<IActionResult> GetMisAlumnos()
        {
            var profesor = User.Identity?.Name;
            if (profesor == null) return Unauthorized();

            var alumnos = await _context.Asignatura_Alumnos
                .Include(aa => aa.Alumno)
                .Where(aa => aa.Asignatura.Profesor == profesor)
                .Select(aa => new
                {
                    id = aa.Alumno.Id,
                    nombreCompleto = aa.Alumno.Nombre + " " + aa.Alumno.Apellido,
                    asignaturaId = aa.AsignaturaId,
                    asignaturaNombre = aa.Asignatura.Clase,
                    asignaturaAlumnoId = aa.Id
                })
                .ToListAsync();

            return Ok(alumnos);
        }

        // POST
        [HttpPost]
        [Authorize(Roles = "Admin,Profesor")]
        public async Task<ActionResult<Notas>> PostNota(Notas nota)
        {
            try
            {
                // Limpiamos el objeto de navegación por si acaso Angular envió algo ahí
                nota.AsignaturaAlumno = null;

                // 1. Verificamos si ya existe en la DB (aunque no se vea en tu pantalla)
                var existe = await _context.Notas.AnyAsync(n => n.AsignaturaAlumnoId == nota.AsignaturaAlumnoId);
                if (existe)
                {
                    return BadRequest(new { mensaje = "Conflicto: Esta matrícula ya tiene una nota registrada en la base de datos." });
                }

                _context.Notas.Add(nota);
                await _context.SaveChangesAsync();
                return CreatedAtAction(nameof(GetNotas), new { id = nota.Id }, nota);
            }
            catch (DbUpdateException ex)
            {
                // Si el error viene de la base de datos (como el índice único)
                return StatusCode(500, new { mensaje = "Error de base de datos: ¿Quizás la nota ya existe?", detalle = ex.InnerException?.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error inesperado", detalle = ex.Message });
            }
        }


        // DELETE
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Profesor")]
        public async Task<IActionResult> DeleteNota(int id)
        {
            var nota = await _context.Notas.FindAsync(id);
            if (nota == null) return NotFound();

            _context.Notas.Remove(nota);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        private string Normalizar(string texto)
        {
            if (string.IsNullOrEmpty(texto)) return "";

            var normalizedString = texto.Normalize(System.Text.NormalizationForm.FormD);
            var stringBuilder = new System.Text.StringBuilder();

            foreach (var c in normalizedString)
            {
                if (System.Globalization.CharUnicodeInfo.GetUnicodeCategory(c) != System.Globalization.UnicodeCategory.NonSpacingMark)
                {
                    stringBuilder.Append(c);
                }
            }

            return stringBuilder.ToString().Normalize(System.Text.NormalizationForm.FormC)
                .ToLower().Replace(" ", "").Trim();
        }
    }
}