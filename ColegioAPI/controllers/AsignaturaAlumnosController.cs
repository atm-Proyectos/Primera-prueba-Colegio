using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ColegioAPI.Data;
using ColegioAPI.models;

namespace ColegioAPI.Controllers
{
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
        public async Task<ActionResult<IEnumerable<object>>> GetMatriculas()
        {
            return await _context.Asignatura_Alumnos
                .Include(a => a.Alumno)
                .Include(a => a.Asignatura)
                .Select(m => new
                {
                    Id = m.Id,
                    AlumnoId = m.AlumnoId,
                    AsignaturaId = m.AsignaturaId,
                    Alumno = m.Alumno.Nombre + " " + m.Alumno.Apellido,
                    Asignatura = m.Asignatura.Clase,
                    Año = m.AñoEscolar
                })
                .ToListAsync();
        }

        // POST: MATRICULAR A UN ALUMNO EN UNA ASIGNATURA
        [HttpPost]
        public async Task<ActionResult<AsignaturaAlumno>> Matricular(int alumnoId, int asignaturaId)
        {
            // 1. Validar que no esté ya matriculado para no duplicar
            var existe = await _context.Asignatura_Alumnos
                .AnyAsync(x => x.AlumnoId == alumnoId && x.AsignaturaId == asignaturaId);

            if (existe)
            {
                return BadRequest("El alumno ya está matriculado en esta asignatura.");
            }

            // 2. Crear la nueva matrícula
            var nuevaMatricula = new AsignaturaAlumno
            {
                AlumnoId = alumnoId,
                AsignaturaId = asignaturaId,
                AñoEscolar = 2026,              // Lo ponemos fijo o lo calculamos
                FechaMatricula = DateTime.UtcNow // Fecha de hoy
            };

            _context.Asignatura_Alumnos.Add(nuevaMatricula);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Alumno matriculado correctamente", id = nuevaMatricula.Id });
        }

        // DELETE: Desmatricular
        [HttpDelete("{id}")]
        public async Task<IActionResult> Desmatricular(int id)
        {
            var matricula = await _context.Asignatura_Alumnos.FindAsync(id);
            if (matricula == null) return NotFound();

            _context.Asignatura_Alumnos.Remove(matricula);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}