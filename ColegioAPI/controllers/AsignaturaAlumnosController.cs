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
        [Authorize(Roles = "Admin,Profesor,Alumno")]
        public async Task<ActionResult<AsignaturaAlumno>> Matricular([FromBody] MatriculaDTO datos)
        {
            // Verificamos que los IDs sean válidos (> 0)
            if (datos.AlumnoId <= 0 || datos.AsignaturaId <= 0)
            {
                return BadRequest("IDs de alumno o asignatura no válidos.");
            }

            var existe = await _context.Asignatura_Alumnos
                .AnyAsync(x => x.AlumnoId == datos.AlumnoId && x.AsignaturaId == datos.AsignaturaId);

            if (existe)
            {
                return BadRequest("El alumno ya está matriculado en esta asignatura.");
            }

            var nuevaMatricula = new AsignaturaAlumno
            {
                AlumnoId = datos.AlumnoId,
                AsignaturaId = datos.AsignaturaId,
                AñoEscolar = 2026,
                FechaMatricula = DateTime.UtcNow
            };

            _context.Asignatura_Alumnos.Add(nuevaMatricula);
            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Alumno matriculado correctamente", id = nuevaMatricula.Id });
        }

        // DELETE: Desmatricular
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Profesor")]
        public async Task<IActionResult> Desmatricular(int id)
        {
            var matricula = await _context.Asignatura_Alumnos.FindAsync(id);
            if (matricula == null) return NotFound();

            _context.Asignatura_Alumnos.Remove(matricula);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        public class MatriculaDTO
        {
            public int AlumnoId { get; set; }
            public int AsignaturaId { get; set; }
        }
    }
}