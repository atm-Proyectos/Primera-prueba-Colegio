using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ColegioAPI.Data;
using ColegioAPI.models;
using Microsoft.AspNetCore.Authorization;

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

        // GET: api/Alumnos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Alumnos>>> GetAlumnos()
        {
            return await _context.Alumnos.ToListAsync();
        }

        // GET: api/Alumnos/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Alumnos>> GetAlumnos(int id)
        {
            var alumnos = await _context.Alumnos.FindAsync(id);
            if (alumnos == null) return NotFound();
            return alumnos;
        }

        // POST: api/Alumnos
        [HttpPost]
        public async Task<IActionResult> PostAlumnos(Alumnos alumnos)
        {
            // 1. Guardar Alumno
            _context.Alumnos.Add(alumnos);
            await _context.SaveChangesAsync();

            // 2. Generar Usuario (Nombre + Apellido)
            string nombreCompleto = alumnos.Nombre + " " + alumnos.Apellido;
            string nombreNormalizado = Normalizar(nombreCompleto);

            // Pequeña protección: si ya existe, le añade el ID al final
            if (await _context.Usuarios.AnyAsync(u => u.NombreUsuario == nombreNormalizado))
            {
                nombreNormalizado = nombreNormalizado + alumnos.Id;
            }

            // 3. Crear Usuario
            var nuevoUsuario = new User
            {
                Id = 0,
                NombreUsuario = nombreNormalizado,
                Password = BCrypt.Net.BCrypt.HashPassword("1234"),
                Rol = "Alumno"
            };

            _context.Usuarios.Add(nuevoUsuario);
            await _context.SaveChangesAsync();

            // 4. RETORNAR CREDENCIALES
            return Ok(new
            {
                mensaje = "Alumno creado con éxito",
                alumno = alumnos,
                credenciales = new
                {
                    usuario = nombreNormalizado,
                    password = "1234"
                }
            });
        }

        // PUT: api/Alumnos/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAlumnos(int id, Alumnos alumnos)
        {
            if (id != alumnos.Id) return BadRequest();
            _context.Entry(alumnos).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AlumnosExists(id)) return NotFound();
                else throw;
            }

            return NoContent();
        }

        // DELETE: api/Alumnos/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAlumnos(int id)
        {
            var alumnos = await _context.Alumnos.FindAsync(id);
            if (alumnos == null) return NotFound();

            _context.Alumnos.Remove(alumnos);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool AlumnosExists(int id)
        {
            return _context.Alumnos.Any(e => e.Id == id);
        }

        private string Normalizar(string texto)
        {
            if (string.IsNullOrEmpty(texto)) return "";
            texto = texto.ToLowerInvariant();
            texto = texto.Replace("á", "a").Replace("é", "e").Replace("í", "i").Replace("ó", "o").Replace("ú", "u");
            texto = texto.Replace("Á", "a").Replace("É", "e").Replace("Í", "i").Replace("Ó", "o").Replace("Ú", "u");
            texto = texto.Replace("ñ", "n").Replace("Ñ", "n");
            return texto.Trim();
        }
    }
}