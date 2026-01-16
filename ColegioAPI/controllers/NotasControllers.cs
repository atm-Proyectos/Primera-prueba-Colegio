using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ColegioAPI.Data;
using ColegioAPI.models;

namespace ColegioAPI.Controllers
{
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

        // ==========================================
        //  MÉTODO BUSCADOR
        // ==========================================
        [HttpGet("buscar")]
        public async Task<ActionResult<IEnumerable<object>>> BuscarNotas(string? texto)
        {
            if (string.IsNullOrEmpty(texto))
            {
                // Si no hay texto, devolvemos las últimas 20 notas
                return await _context.Notas
                    .Include(n => n.Alumno)
                    .Include(n => n.Asignatura)
                    .Take(20)
                    .Select(n => new
                    {
                        Id = n.Id,
                        Alumno = n.Alumno.Nombre + " " + n.Alumno.Apellido,
                        Asignatura = n.Asignatura.Clase,
                        Profesor = n.Asignatura.Profesor,
                        Valor = n.Valor
                    })
                    .ToListAsync();
            }

            // BÚSQUEDA PROFESIONAL
            var resultados = await _context.Notas
                .Include(n => n.Alumno)
                .Include(n => n.Asignatura)
                .Where(n =>
                    n.Alumno.Nombre.ToLower().Contains(texto.ToLower()) ||
                    n.Alumno.Apellido.ToLower().Contains(texto.ToLower()) ||
                    n.Asignatura.Clase.ToLower().Contains(texto.ToLower()) ||
                    n.Valor.ToString().Contains(texto)
                 )
                .Select(n => new
                {
                    Id = n.Id,
                    Alumno = n.Alumno.Nombre + " " + n.Alumno.Apellido,
                    Asignatura = n.Asignatura.Clase,
                    Profesor = n.Asignatura.Profesor,
                    Valor = n.Valor
                })
                .ToListAsync();

            return Ok(resultados);
        }

        // ==========================================
        //  MÉTODOS BÁSICOS (CRUD)
        // ==========================================

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetNotas()
        {
            // Esto busca la nota Y TAMBIÉN la información del Alumno y la Asignatura
            var notas = await _context.Notas
                .Include(n => n.Alumno)      // Carga datos del alumno
                .Include(n => n.Asignatura)  // Carga datos de la asignatura
                .Select(n => new
                {
                    id = n.Id,
                    valor = n.Valor,
                    alumnoId = n.AlumnoId,
                    asignaturaId = n.AsignaturaId,

                    // Aquí creamos los textos que verás en la tabla
                    nombreAlumno = n.Alumno.Nombre + " " + n.Alumno.Apellido, // Juntamos nombre y apellido
                    nombreAsignatura = n.Asignatura.Clase
                })
                .ToListAsync();

            return Ok(notas);
        }

        // POST
        [HttpPost]
        public async Task<ActionResult<Notas>> PostNota(Notas nota)
        {
            _context.Notas.Add(nota);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetNotas), new { id = nota.Id }, nota);
        }

        // PUT: api/Notas/5
        [HttpPut("{id}")]
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