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
                        Alumno = n.AsignaturaAlumno.Alumno.Nombre + " " + n.AsignaturaAlumno.Alumno.Apellido,
                        Asignatura = n.AsignaturaAlumno.Asignatura.Clase,
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
                    Alumno = n.AsignaturaAlumno.Alumno.Nombre + " " + n.AsignaturaAlumno.Alumno.Apellido,
                    Asignatura = n.AsignaturaAlumno.Asignatura.Clase,
                    Profesor = n.AsignaturaAlumno.Asignatura.Profesor,
                    Valor = n.Valor
                })
                .ToListAsync();

            return Ok(resultados);
        }

        //  MÉTODOS BÁSICOS (CRUD)

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<dynamic>>> GetNotas()
        {
            var notas = await _context.Notas
                .Include(n => n.AsignaturaAlumno)
                .Include(n => n.AsignaturaAlumno.Asignatura)
                .Select(n => new
                {
                    id = n.Id,
                    valor = n.Valor,
                    alumnoId = n.AsignaturaAlumno.AlumnoId,
                    asignaturaId = n.AsignaturaAlumno.AsignaturaId,

                    nombreAlumno = n.AsignaturaAlumno.Alumno.Nombre + " " + n.AsignaturaAlumno.Alumno.Apellido,
                    nombreAsignatura = n.AsignaturaAlumno.Asignatura.Clase
                })
                .ToListAsync();

            return Ok(notas);
        }

        // POST
        [HttpPost]
        [Authorize(Roles = "!Alumno")]
        public async Task<ActionResult<Notas>> PostNota(Notas nota)
        {
            _context.Notas.Add(nota);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetNotas), new { id = nota.Id }, nota);
        }

        // PUT: api/Notas/5
        [HttpPut("{id}")]
        [Authorize(Roles = "!Alumno")]
        public async Task<IActionResult> PutNota(int id, Notas nota)
        {
            if (id != nota.Id) return BadRequest();

            _context.Entry(nota).State = EntityState.Modified;

            try { await _context.SaveChangesAsync(); }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Notas.Any(e => e.Id == id)) return NotFound();
                else throw;
            }

            return NoContent();
        }

        // DELETE
        [HttpDelete("{id}")]
        [Authorize(Roles = "!Alumno")]
        public async Task<IActionResult> DeleteNota(int id)
        {
            var nota = await _context.Notas.FindAsync(id);
            if (nota == null) return NotFound();

            _context.Notas.Remove(nota);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}