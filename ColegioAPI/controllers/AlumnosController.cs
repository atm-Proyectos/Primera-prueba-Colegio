using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ColegioAPI.Data;
using ColegioAPI.models;

namespace ColegioAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AlumnosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AlumnosController(AppDbContext context)
        {
            _context = context;
        }

        // 1. LEER TODOS
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Alumnos>>> GetAlumnos()
        {
            return await _context.Alumnos.OrderBy(a => a.Apellido).ToListAsync();
        }

        // 2. CREAR
        [HttpPost]
        public async Task<ActionResult<Alumnos>> PostAlumno(Alumnos alumno)
        {
            _context.Alumnos.Add(alumno);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAlumnos), new { id = alumno.Id }, alumno);
        }

        // 3. EDITAR (PUT)
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAlumno(int id, Alumnos alumno)
        {
            if (id != alumno.Id) return BadRequest();

            _context.Entry(alumno).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Alumnos.Any(e => e.Id == id)) return NotFound();
                else throw;
            }

            return NoContent();
        }

        // 4. BORRAR (DELETE)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAlumno(int id)
        {
            var alumno = await _context.Alumnos.FindAsync(id);
            if (alumno == null) return NotFound();

            _context.Alumnos.Remove(alumno);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}