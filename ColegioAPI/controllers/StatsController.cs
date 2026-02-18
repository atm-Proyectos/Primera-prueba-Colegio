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
            var todosAlumnos = await _context.Alumnos
                .Include(a => a.AsignaturaAlumnos!)
                .ThenInclude(aa => aa.Asignatura)
                .Include(a => a.AsignaturaAlumnos!)
                .ThenInclude(aa => aa.Notas)
                .ToListAsync();

            var alumno = todosAlumnos.FirstOrDefault(a =>
                Normalizar($"{a.Nombre} {a.Apellido}") == Normalizar(nombreUsuarioRaw));

            if (alumno == null) return NotFound("Alumno no encontrado");

            // Separamos las asignaturas por estado
            var matriculasConNota = alumno.AsignaturaAlumnos!
                .Where(aa => aa.Notas != null).ToList();

            var aprobadas = matriculasConNota.Count(aa => aa.Notas!.Valor >= 5);
            var suspensas = matriculasConNota.Count(aa => aa.Notas!.Valor < 5);
            var sinCalificar = alumno.AsignaturaAlumnos!.Count - matriculasConNota.Count;

            return Ok(new
            {
                totalAsignaturas = alumno.AsignaturaAlumnos!.Count,
                promedioGlobal = matriculasConNota.Any()
                    ? Math.Round(matriculasConNota.Average(aa => (double)aa.Notas!.Valor), 2)
                    : 0,
                aprobadas,
                suspensas,
                sinCalificar,
                // Datos para la tarta 🥧
                statsTarta = new[] {
            new { name = "Aprobadas", value = aprobadas },
            new { name = "Suspensas", value = suspensas },
            new { name = "Sin Calificar", value = sinCalificar }
        },

                // Datos para las barras 📊
                graficaNotas = matriculasConNota.Select(aa => new
                {
                    name = aa.Asignatura?.Clase ?? "Asignatura",
                    value = aa.Notas!.Valor
                }),
                // Lista de asignaturas matriculadas
                asignaturas = alumno.AsignaturaAlumnos.Select(aa => new
                {
                    nombre = aa.Asignatura?.Clase,
                    profesor = aa.Asignatura?.Profesor
                })
            });
        }
        private string Normalizar(string texto)
        {
            if (string.IsNullOrEmpty(texto)) return "";

            var normalizedString = texto.Normalize(System.Text.NormalizationForm.FormD);
            var stringBuilder = new System.Text.StringBuilder();

            foreach (var c in normalizedString)
            {
                if (System.Globalization.CharUnicodeInfo.GetUnicodeCategory(c) != System.Globalization.UnicodeCategory.NonSpacingMark)
                {
                    stringBuilder.Append(c);
                }
            }

            return stringBuilder.ToString().Normalize(System.Text.NormalizationForm.FormC)
                .ToLower().Replace(" ", "").Trim();
        }

        // ==========================================
        // 4. ROL PROFESOR: DASHBOARD ESPECÍFICO
        // ==========================================
        [HttpGet("profesor")]
        [Authorize(Roles = "Profesor")]
        public async Task<ActionResult<object>> GetStatsProfesor()
        {
            var usuario = User.Identity?.Name ?? "";

            // 1. Cargamos asignaturas
            var misAsignaturas = await _context.Asignaturas
                .Where(a => a.Profesor != null && EF.Functions.ILike(a.Profesor, usuario))
                .ToListAsync();

            if (!misAsignaturas.Any()) return Ok(new { mensaje = "No hay asignaturas" });
            var idsAsignaturas = misAsignaturas.Select(a => a.Id).ToList();

            // 2. Cargamos matrículas y notas con TODA la jerarquía (Include/ThenInclude)
            var misMatriculas = await _context.Asignatura_Alumnos
                .Include(aa => aa.Alumno)
                .Include(aa => aa.Asignatura)
                .Where(aa => idsAsignaturas.Contains(aa.AsignaturaId)).ToListAsync();

            var misNotas = await _context.Notas
                .Include(n => n.AsignaturaAlumno).ThenInclude(aa => aa.Alumno)
                .Where(n => idsAsignaturas.Contains(n.AsignaturaAlumno.AsignaturaId)).ToListAsync();

            // 3. Cálculos de Ratio y Pendientes
            var idsConNota = misNotas.Select(n => n.AsignaturaAlumnoId).ToList();
            var pendientesData = misMatriculas.Where(m => !idsConNota.Contains(m.Id))
                .Select(m => new
                {
                    nombre = m.Alumno != null ? $"{m.Alumno.Nombre} {m.Alumno.Apellido}" : "Sin nombre",
                    asignatura = m.Asignatura?.Clase ?? "N/A"
                }).ToList();

            var mejorNotaObj = misNotas.OrderByDescending(n => n.Valor).FirstOrDefault();
            var peorNotaObj = misNotas.OrderBy(n => n.Valor).FirstOrDefault();

            // 🚀 RESPUESTA FINAL: Usamos camelCase y propiedades name/value para las gráficas
            return Ok(new
            {
                totalAlumnos = misMatriculas.Select(m => m.AlumnoId).Distinct().Count(),
                totalAsignaturas = misAsignaturas.Count,

                mejorAlumno = new
                {
                    nombre = mejorNotaObj?.AsignaturaAlumno?.Alumno != null ? $"{mejorNotaObj.AsignaturaAlumno.Alumno.Nombre} {mejorNotaObj.AsignaturaAlumno.Alumno.Apellido}" : "N/A",
                    valor = mejorNotaObj?.Valor ?? 0m
                },
                peorAlumno = new
                {
                    nombre = peorNotaObj?.AsignaturaAlumno?.Alumno != null ? $"{peorNotaObj.AsignaturaAlumno.Alumno.Nombre} {peorNotaObj.AsignaturaAlumno.Alumno.Apellido}" : "N/A",
                    valor = peorNotaObj?.Valor ?? 0m
                },

                alumnosEnRiesgo = misNotas.Where(n => n.Valor < 5).Select(n => new
                {
                    nombre = n.AsignaturaAlumno?.Alumno != null ? $"{n.AsignaturaAlumno.Alumno.Nombre} {n.AsignaturaAlumno.Alumno.Apellido}" : "Desconocido",
                    valor = n.Valor
                }).Take(5).ToList(),

                aprobadosVsSuspensos = new[] {
            new { name = "Aprobados", value = misNotas.Count(n => n.Valor >= 5) },
            new { name = "Suspensos", value = misNotas.Count(n => n.Valor < 5) },
            new { name = "Sin Calificar", value = pendientesData.Count }
        },

                pendientes = pendientesData,
                progresoCorreccion = new[] {
            new { name = "Evaluados", value = misNotas.Count },
            new { name = "Pendientes", value = pendientesData.Count }
        },
                alumnosPorAsignatura = misAsignaturas.Select(a => new
                {
                    name = a.Clase,
                    value = misMatriculas.Count(m => m.AsignaturaId == a.Id)
                })
            });
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
        public List<DatoGrafica> AsignaturasMatriculadas { get; set; } = new List<DatoGrafica>();
    }

    public class DatoGrafica
    {
        public string nombre { get; set; }
        public int valor { get; set; }
        public decimal ValorDecimal { get; set; }
        public string Asignatura { get; set; } = string.Empty;
    }
}