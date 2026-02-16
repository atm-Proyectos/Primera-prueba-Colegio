using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ColegioAPI.Data;
using ColegioAPI.models;
using System.Threading.Tasks;
using System.Linq;
using System.Collections.Generic;
using System;
using Microsoft.AspNetCore.Authorization;

namespace ColegioAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StatsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public StatsController(AppDbContext context)
        {
            _context = context;
        }

        // ==========================================
        // 1. ROL ALUMNO: "MI PERFIL"
        // ==========================================
        [HttpGet("alumno")]
        [Authorize(Roles = "Alumno")]
        public async Task<ActionResult<object>> GetStatsAlumno()
        {
            var nombreUsuarioRaw = User.Identity?.Name ?? "";

            if (string.IsNullOrEmpty(nombreUsuarioRaw))
                return BadRequest("Usuario no identificado");

            var todosAlumnos = await _context.Alumnos
                .Include(a => a.AsignaturaAlumnos!)
                .ThenInclude(aa => aa.Asignatura)
                .ToListAsync();

            // Filtro en memoria para evitar problemas de mayúsculas/minúsculas
            var alumno = todosAlumnos.FirstOrDefault(a =>
                (a.Nombre + " " + a.Apellido).Replace(" ", "").ToLower() == nombreUsuarioRaw.Replace(" ", "").ToLower() ||
                a.Nombre.ToLower() == nombreUsuarioRaw.ToLower()
            );

            if (alumno == null)
            {
                // Intento de respaldo: Buscar el primero si es demo
                alumno = todosAlumnos.FirstOrDefault();
            }

            if (alumno == null) return NotFound("Alumno no encontrado");

            // Calcular notas del alumno
            var misMatriculasIds = alumno.AsignaturaAlumnos.Select(aa => aa.Id).ToList();
            var misNotas = await _context.Notas
                .Where(n => misMatriculasIds.Contains(n.AsignaturaAlumnoId))
                .ToListAsync();

            var stats = new
            {
                TotalAsignaturas = alumno.AsignaturaAlumnos.Count,
                NotaMedia = misNotas.Any() ? Math.Round(misNotas.Average(n => n.Valor), 2) : 0,
                AsignaturasAprobadas = misNotas.Where(n => n.Valor >= 5).Select(n => n.AsignaturaAlumnoId).Distinct().Count(),

                // Gráfica de evolución
                EvolucionNotas = misNotas.Select(n => new
                {
                    name = n.AsignaturaAlumno?.Asignatura?.Clase ?? "Asignatura",
                    value = n.Valor
                })
            };

            return Ok(stats);
        }

        // ==========================================
        // 2. ROL PROFESOR: DASHBOARD ESPECÍFICO
        // ==========================================
        [HttpGet("profesor")]
        [Authorize(Roles = "Profesor")]
        public async Task<ActionResult<object>> GetStatsProfesor()
        {
            var usuario = User.Identity?.Name;

            // 1. Buscamos asignaturas
            var todasAsignaturas = await _context.Asignaturas.ToListAsync();
            var misAsignaturas = todasAsignaturas
                .Where(a => a.Profesor != null && a.Profesor.ToLower().Contains(usuario?.ToLower() ?? ""))
                .ToList();

            if (!misAsignaturas.Any()) misAsignaturas = todasAsignaturas;

            var idsAsignaturas = misAsignaturas.Select(a => a.Id).ToList();

            // 2. Traemos Matrículas y Notas
            var misMatriculas = await _context.Asignatura_Alumnos
                .Include(aa => aa.Alumno)
                .Include(aa => aa.Asignatura)
                .Where(aa => idsAsignaturas.Contains(aa.AsignaturaId))
                .ToListAsync();

            var misNotas = await _context.Notas
                .Include(n => n.AsignaturaAlumno)
                .ThenInclude(aa => aa.Alumno)
                .Where(n => idsAsignaturas.Contains(n.AsignaturaAlumno.AsignaturaId))
                .ToListAsync();

            // --- CÁLCULOS ---

            // A) Totales
            var totalAlumnosReales = misMatriculas.Select(m => m.AlumnoId).Distinct().Count();
            var totalExamenesEsperados = misMatriculas.Count;
            var totalExamenesCorregidos = misNotas.Count;

            // B) KPI Mejor/Peor
            var mejorNotaObj = misNotas.OrderByDescending(n => n.Valor).FirstOrDefault();
            var peorNotaObj = misNotas.OrderBy(n => n.Valor).FirstOrDefault();

            // C) Pendientes (Lista detallada)
            var listaPendientes = misMatriculas
                .Where(m => !misNotas.Any(n => n.AsignaturaAlumnoId == m.Id))
                .Select(m => new
                {
                    nombre = m.Alumno.Nombre + " " + m.Alumno.Apellido,
                    asignatura = m.Asignatura.Clase
                })
                .Take(10).ToList();

            // D) Gráfica Progreso (Corrección)
            var totalPendientes = totalExamenesEsperados - totalExamenesCorregidos;
            var progresoCorreccion = new[]
            {
        new { name = "Evaluados", value = totalExamenesCorregidos },
        new { name = "Pendientes", value = totalPendientes < 0 ? 0 : totalPendientes }
    };

            // E) Gráfica Ratio (Aprobados vs Suspensos vs Sin Calificar) - CORREGIDO
            var aprobados = misNotas.Count(n => n.Valor >= 5);
            var suspensos = misNotas.Count(n => n.Valor < 5);
            // "Sin Calificar" es lo mismo que los pendientes (matrículas sin nota)
            var sinCalificar = totalExamenesEsperados - (aprobados + suspensos);

            var ratioData = new[]
            {
        new { name = "Aprobados", value = aprobados },
        new { name = "Suspensos", value = suspensos },
        new { name = "Sin Calificar", value = sinCalificar < 0 ? 0 : sinCalificar }
    };

            // --- RESPUESTA FINAL ---
            var stats = new
            {
                TotalAlumnos = totalAlumnosReales,
                TotalAsignaturas = misAsignaturas.Count,

                MejorAlumno = mejorNotaObj != null
                    ? new { nombre = mejorNotaObj.AsignaturaAlumno.Alumno.Nombre, valor = mejorNotaObj.Valor }
                    : new { nombre = "N/A", valor = 0.0m },

                PeorAlumno = peorNotaObj != null
                    ? new { nombre = peorNotaObj.AsignaturaAlumno.Alumno.Nombre, valor = peorNotaObj.Valor }
                    : new { nombre = "N/A", valor = 0.0m },

                AlumnosEnRiesgo = misNotas
                    .Where(n => n.Valor < 5)
                    .Select(n => new
                    {
                        nombre = n.AsignaturaAlumno.Alumno.Nombre + " " + n.AsignaturaAlumno.Alumno.Apellido,
                        valor = n.Valor
                    })
                    .Take(5).ToList(),

                Pendientes = listaPendientes,
                ProgresoCorreccion = progresoCorreccion,

                AprobadosVsSuspensos = ratioData,

                AlumnosPorAsignatura = misAsignaturas.Select(a => new
                {
                    name = a.Clase,
                    value = misMatriculas.Count(m => m.AsignaturaId == a.Id)
                })
            };

            return Ok(stats);
        }
        // ==========================================
        // 3. ROL ADMIN: DASHBOARD GENERAL
        // ==========================================
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<DashboardStats>> GetStatsAdmin()
        {
            var totalAlumnos = await _context.Alumnos.CountAsync();
            var totalAsignaturas = await _context.Asignaturas.CountAsync();

            // 1. Cálculo de Edad Media (Directo desde el campo Edad)
            var alumnos = await _context.Alumnos.ToListAsync();
            double edadMedia = totalAlumnos > 0 ? alumnos.Average(a => (double)a.Edad) : 0;

            // 2. Popularidad de Asignaturas
            var alumnosPorAsignatura = await _context.Asignatura_Alumnos
                .GroupBy(aa => aa.Asignatura.Clase)
                .Select(g => new DatoGrafica { nombre = g.Key, valor = g.Count() })
                .ToListAsync();

            // 3. Distribución por Edades (Agrupando por el número de edad)
            var distribucionEdades = alumnos
                .GroupBy(a => a.Edad)
                .Select(g => new DatoGrafica
                {
                    nombre = g.Key.ToString() + " años",
                    valor = g.Count()
                })
                .OrderBy(x => x.nombre)
                .ToList();

            // 4. Nota Media por Asignatura
            var notasPorAsignatura = await _context.Notas
                .Include(n => n.AsignaturaAlumno)
                .ThenInclude(aa => aa.Asignatura)
                .GroupBy(n => n.AsignaturaAlumno.Asignatura.Clase)
                .Select(g => new DatoGrafica
                {
                    nombre = g.Key,
                    // IMPORTANTE: Asignar a ValorDecimal casteando a double para no perder decimales
                    ValorDecimal = Math.Round(g.Average(n => (decimal)n.Valor), 1),
                    // Rellenamos valor también por compatibilidad
                    valor = (int)Math.Round(g.Average(n => n.Valor))
                })
                .ToListAsync();

            // 5. Aprobados vs Suspensos
            var totalAprobados = await _context.Notas.CountAsync(n => n.Valor >= 5);
            var totalSuspensos = await _context.Notas.CountAsync(n => n.Valor < 5);
            var aprobadosVsSuspensos = new List<DatoGrafica>
    {
        new DatoGrafica { nombre = "Aprobados", valor = totalAprobados },
        new DatoGrafica { nombre = "Suspensos", valor = totalSuspensos }
    };

            return Ok(new DashboardStats
            {
                TotalAlumnos = totalAlumnos,
                TotalAsignaturas = totalAsignaturas,
                EdadMediaGlobal = Math.Round(edadMedia, 1),
                AlumnosPorAsignatura = await _context.Asignatura_Alumnos
                .GroupBy(aa => aa.Asignatura.Clase)
                .Select(g => new DatoGrafica { nombre = g.Key, valor = g.Count() })
                .ToListAsync(),
                DistribucionEdades = distribucionEdades,
                NotaMediaPorAsignatura = notasPorAsignatura,
                AprobadosVsSuspensos = new List<DatoGrafica>
    {
        new DatoGrafica { nombre = "Aprobados", valor = totalAprobados },
        new DatoGrafica { nombre = "Suspensos", valor = totalSuspensos }
    }
            });
        }
    }

    // CLASES DTO
    public class DashboardStats
    {
        public int TotalAlumnos { get; set; }
        public int TotalAsignaturas { get; set; }
        public double EdadMediaGlobal { get; set; }
        public List<DatoGrafica> AlumnosPorAsignatura { get; set; } = new List<DatoGrafica>();
        public List<DatoGrafica> DistribucionEdades { get; set; } = new List<DatoGrafica>();
        public List<DatoGrafica> NotaMediaPorAsignatura { get; set; } = new List<DatoGrafica>();
        public List<DatoGrafica> AprobadosVsSuspensos { get; set; } = new List<DatoGrafica>();
    }

    public class DatoGrafica
    {
        public string nombre { get; set; }
        public int valor { get; set; }
        public decimal ValorDecimal { get; set; }
    }
}