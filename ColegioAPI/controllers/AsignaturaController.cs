using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ColegioAPI.Data;
using ColegioAPI.models;
using Microsoft.AspNetCore.Authorization;

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

        // GET:
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Asignaturas>>> GetAsignaturas()
        {
            return await _context.Asignaturas.ToListAsync();
        }

        // POST:
        [HttpPost]
        [Authorize(Roles = "Admin,Profesor,Alumno")]
        public async Task<ActionResult<Asignaturas>> PostAsignatura(Asignaturas asignatura)
        {
            _context.Asignaturas.Add(asignatura);
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetAsignaturas", new { id = asignatura.Id }, asignatura);
        }

        // PUT: api/Asignaturas/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Profesor,Alumno")]
        public async Task<IActionResult> PutAsignatura(int id, Asignaturas asignatura)
        {
            if (id != asignatura.Id) return BadRequest();

            _context.Entry(asignatura).State = EntityState.Modified;

            try { await _context.SaveChangesAsync(); }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Asignaturas.Any(e => e.Id == id)) return NotFound();
                else throw;
            }

            return NoContent();
        }

        // DELETE:
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Profesor")]
        public async Task<IActionResult> DeleteAsignatura(int id)
        {
            var asignatura = await _context.Asignaturas.FindAsync(id);
            if (asignatura == null) return NotFound();

            // Verificar si tiene notas antes de borrar para no romper la BD
            _context.Asignaturas.Remove(asignatura);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}