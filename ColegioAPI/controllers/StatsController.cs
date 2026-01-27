using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ColegioAPI.Data;
using ColegioAPI.models;
using System.Threading.Tasks;
using System.Linq;
using System.Collections.Generic;
using System;

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

        [HttpGet]
        public async Task<ActionResult<DashboardStats>> GetStats()
        {
            // 1. KPIs Básicos
            var totalAlumnos = await _context.Alumnos.CountAsync();
            var totalAsignaturas = await _context.Asignaturas.CountAsync();

            // Calculamos media de edad (manejando posible división por 0)
            var edadMedia = totalAlumnos > 0
                ? await _context.Alumnos.AverageAsync(a => a.Edad)
                : 0;

            // 2. Gráfica: Alumnos por Asignatura
            // IMPORTANTE: Aquí usamos Asignatura_Alumnos tal cual lo tienes en tu DbContext
            var alumnosPorAsignatura = await _context.Asignatura_Alumnos
                .Include(m => m.Asignatura)
                .GroupBy(m => m.Asignatura.Clase)
                .Select(g => new DatoGrafica
                {
                    Nombre = g.Key,
                    Valor = g.Count()
                })
                .ToListAsync();

            // 3. Gráfica: Distribución de Edades
            var edades = await _context.Alumnos
                .GroupBy(a => a.Edad)
                .Select(g => new DatoGrafica
                {
                    Nombre = g.Key.ToString() + " Años",
                    Valor = g.Count()
                })
                .OrderBy(d => d.Nombre)
                .ToListAsync();

            // 4. Gráfica: Nota Media por Asignatura (CORREGIDO EL ERROR DECIMAL)
            var notasPorAsignatura = await _context.Notas
                .Include(n => n.AsignaturaAlumno)
                .ThenInclude(aa => aa.Asignatura)
                .GroupBy(n => n.AsignaturaAlumno.Asignatura.Clase)
                .Select(g => new DatoGrafica
                {
                    Nombre = g.Key,
                    ValorDecimal = (double)Math.Round(g.Average(n => n.Valor), 1)
                })
                .ToListAsync();

            // 5. Gráfica: Aprobados vs Suspensos
            var totalAprobados = await _context.Notas.CountAsync(n => n.Valor >= 5);
            var totalSuspensos = await _context.Notas.CountAsync(n => n.Valor < 5);

            var aprobadosVsSuspensos = new List<DatoGrafica>
            {
                new DatoGrafica { Nombre = "Aprobados", Valor = totalAprobados },
                new DatoGrafica { Nombre = "Suspensos", Valor = totalSuspensos }
            };

            // 6. Montar respuesta final
            var stats = new DashboardStats
            {
                TotalAlumnos = totalAlumnos,
                TotalAsignaturas = totalAsignaturas,
                EdadMediaGlobal = Math.Round(edadMedia, 1),
                AlumnosPorAsignatura = alumnosPorAsignatura,
                DistribucionEdades = edades,
                NotaMediaPorAsignatura = notasPorAsignatura,
                AprobadosVsSuspensos = aprobadosVsSuspensos
            };

            return Ok(stats);
        }
    }
}