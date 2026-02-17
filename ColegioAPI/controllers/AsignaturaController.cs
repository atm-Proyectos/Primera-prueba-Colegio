using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ColegioAPI.Data;
using ColegioAPI.models;
using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using System;

namespace ColegioAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AsignaturasController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AsignaturasController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Asignaturas
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AsignaturaDTO>>> GetAsignaturas()
        {
            var esProfesor = User.IsInRole("Profesor");
            var usuarioToken = User.Identity?.Name ?? "";
            var esAlumno = User.IsInRole("Alumno");
            int? alumnoId = null;

            if (esAlumno && !string.IsNullOrEmpty(usuarioToken))
            {
                var listaAlumnos = await _context.Alumnos.ToListAsync();

                var miAlumno = listaAlumnos.FirstOrDefault(a =>
                    Normalizar($"{a.Nombre} {a.Apellido}") == Normalizar(usuarioToken)
                );
                if (miAlumno != null) alumnoId = miAlumno.Id;
            }
            // Cargamos asignaturas incluyendo explícitamente las matrículas
            var query = _context.Asignaturas
                .Include(a => a.AsignaturaAlumnos)
                .AsQueryable();

            // Filtro para profesores
            if (User.IsInRole("Profesor"))
            {
                query = query.Where(a => a.Profesor != null &&
                                         EF.Functions.ILike(a.Profesor, usuarioToken));
            }

            var resultados = await query.ToListAsync();

            return Ok(resultados.Select(a => new AsignaturaDTO
            {
                Id = a.Id,
                Clase = a.Clase ?? "Sin nombre",
                Profesor = a.Profesor ?? "Sin asignar",
                // Buscamos si el ID del alumno está en la lista de matrículas de esta asignatura
                MatriculaId = alumnoId.HasValue
                    ? a.AsignaturaAlumnos?
                        .FirstOrDefault(m => m.AlumnoId == alumnoId.Value)?.Id
                    : null
            }));
        }


        // POST: Crear Asignatura
        [HttpPost]
        [Authorize(Roles = "Admin,Profesor")]
        public async Task<IActionResult> PostAsignatura(Asignaturas asignatura)
        {
            // SEGURIDAD: Si es Profesor, forzamos que se la asigne a sí mismo
            if (User.IsInRole("Profesor"))
            {
                asignatura.Profesor = User.Identity?.Name ?? "Desconocido";
            }

            // Normalizamos el nombre de la clase
            asignatura.Clase = Normalizar(asignatura.Clase);

            // Validaciones
            if (string.IsNullOrEmpty(asignatura.Clase))
                return BadRequest("El nombre de la asignatura es obligatorio.");

            if (string.IsNullOrEmpty(asignatura.Profesor))
                return BadRequest("El profesor es obligatorio.");

            _context.Asignaturas.Add(asignatura);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetAsignaturas", new { id = asignatura.Id }, asignatura);
        }

        // PUT: Editar Asignatura
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Profesor,Alumno")]
        public async Task<IActionResult> PutAsignatura(int id, Asignaturas asignatura)
        {
            if (id != asignatura.Id) return BadRequest();

            // Seguridad extra: Un profesor no debería poder cambiar el profesor de la asignatura
            if (User.IsInRole("Profesor"))
            {
                var original = await _context.Asignaturas.AsNoTracking().FirstOrDefaultAsync(a => a.Id == id);
                if (original == null) return NotFound();

                // Si intenta cambiar el dueño de la asignatura, lo bloqueamos o lo ignoramos
                if (original.Profesor != User.Identity?.Name) return Forbid();

                asignatura.Profesor = User.Identity?.Name; // Mantenemos su nombre
            }

            _context.Entry(asignatura).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Asignaturas.Any(e => e.Id == id)) return NotFound();
                else throw;
            }

            return NoContent();
        }

        // DELETE: api/Asignaturas/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")] // Solo Admin borra para evitar desastres
        public async Task<IActionResult> DeleteAsignatura(int id)
        {
            var asignatura = await _context.Asignaturas.FindAsync(id);
            if (asignatura == null) return NotFound();
            _context.Asignaturas.Remove(asignatura);
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