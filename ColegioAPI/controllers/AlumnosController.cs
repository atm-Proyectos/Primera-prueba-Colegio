using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ColegioAPI.Data;
using ColegioAPI.models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace ColegioAPI.Controllers
{
    [Authorize]
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
        [Authorize]
        public async Task<ActionResult<IEnumerable<Alumnos>>> GetAlumnos()
        {
            return await _context.Alumnos.OrderBy(a => a.Apellido).ToListAsync();
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<Alumnos>> GetAlumno(int id)
        {
            var alumno = await _context.Alumnos.FindAsync(id);
            if (alumno == null) return NotFound();
            return alumno;
        }

        // 2. CREAR
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Alumnos>> PostAlumno(Alumnos alumno)
        {
            _context.Alumnos.Add(alumno);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAlumnos), new { id = alumno.Id }, alumno);
        }

        // 3. EDITAR (PUT)
        [HttpPut("{id}")]
        [Authorize(Roles = "!Alumno")]
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
        [Authorize(Roles = "Admin")]
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