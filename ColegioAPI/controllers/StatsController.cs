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
            new { Name = "Aprobadas", Value = aprobadas },
            new { Name = "Suspensas", Value = suspensas },
            new { Name = "Sin Calificar", Value = sinCalificar }
        },

                // Datos para las barras 📊
                graficaNotas = matriculasConNota.Select(aa => new
                {
                    Name = aa.Asignatura?.Clase ?? "Asignatura",
                    Value = aa.Notas!.Valor
                }),
                // Lista de asignaturas matriculadas
                asignaturas = alumno.AsignaturaAlumnos.Select(aa => new
                {
                    Nombre = aa.Asignatura?.Clase,
                    Profesor = aa.Asignatura?.Profesor
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
                    id = m.Id,
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
                    Id = mejorNotaObj?.Id ?? 0,
                    Nombre = mejorNotaObj?.AsignaturaAlumno?.Alumno != null ? $"{mejorNotaObj.AsignaturaAlumno.Alumno.Nombre} {mejorNotaObj.AsignaturaAlumno.Alumno.Apellido}" : "N/A",
                    Valor = mejorNotaObj?.Valor ?? 0m
                },
                peorAlumno = new
                {
                    Id = peorNotaObj?.Id ?? 0,
                    Nombre = peorNotaObj?.AsignaturaAlumno?.Alumno != null ? $"{peorNotaObj.AsignaturaAlumno.Alumno.Nombre} {peorNotaObj.AsignaturaAlumno.Alumno.Apellido}" : "N/A",
                    Valor = peorNotaObj?.Valor ?? 0m
                },

                alumnosEnRiesgo = misNotas.Where(n => n.Valor < 5).Select(n => new
                {
                    Id = n.Id,
                    Nombre = n.AsignaturaAlumno?.Alumno != null ? $"{n.AsignaturaAlumno.Alumno.Nombre} {n.AsignaturaAlumno.Alumno.Apellido}" : "Desconocido",
                    Valor = n.Valor
                }).Take(5).ToList(),

                aprobadosVsSuspensos = new[] {
            new { Name = "Aprobados", Value = misNotas.Count(n => n.Valor >= 5) },
            new { Name = "Suspensos", Value = misNotas.Count(n => n.Valor < 5) },
            new { Name = "Sin Calificar", Value = pendientesData.Count }
        },

                pendientes = pendientesData,
                progresoCorreccion = new[] {
            new { Name = "Evaluados", Value = misNotas.Count },
            new { Name = "Pendientes", Value = pendientesData.Count }
        },
                alumnosPorAsignatura = misAsignaturas.Select(a => new
                {
                    Name = a.Clase,
                    Value = misMatriculas.Count(m => m.AsignaturaId == a.Id)
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

            var alumnos = await _context.Alumnos.ToListAsync();
            double edadMedia = totalAlumnos > 0 ? alumnos.Average(a => (double)a.Edad) : 0;

            // 1. Popularidad: Corregido a Mayúsculas y campos required
            var alumnosPorAsignatura = await _context.Asignatura_Alumnos
                .GroupBy(aa => aa.Asignatura.Clase)
                .Select(g => new DatoGrafica
                {
                    Nombre = g.Key,
                    Valor = g.Count(),
                    ValorDecimal = 0,
                    Asignatura = ""
                })
                .ToListAsync();

            // 2. Distribución: Corregido el error de conversión int a string
            var distribucionEdades = alumnos
                .GroupBy(a => a.Edad)
                .Select(g => new DatoGrafica
                {
                    Nombre = g.Key.ToString(), // Convertimos el número de edad a string
                    Valor = g.Count(),
                    ValorDecimal = 0,
                    Asignatura = ""
                })
                .OrderBy(x => x.Nombre)
                .ToList();

            // 3. Nota Media
            var notasPorAsignatura = await _context.Notas
                .Include(n => n.AsignaturaAlumno)
                .ThenInclude(aa => aa.Asignatura)
                .GroupBy(n => n.AsignaturaAlumno.Asignatura.Clase)
                .Select(g => new DatoGrafica
                {
                    Nombre = g.Key,
                    ValorDecimal = Math.Round(g.Average(n => (decimal)n.Valor), 1),
                    Valor = (int)Math.Round(g.Average(n => (double)n.Valor)),
                    Asignatura = ""
                })
                .ToListAsync();

            // 4. Aprobados vs Suspensos
            var totalAprobados = await _context.Notas.CountAsync(n => n.Valor >= 5);
            var totalSuspensos = await _context.Notas.CountAsync(n => n.Valor < 5);
            var aprobadosVsSuspensos = new List<DatoGrafica>
    {
        new DatoGrafica { Nombre = "Aprobados", Valor = totalAprobados, ValorDecimal = 0, Asignatura = "" },
        new DatoGrafica { Nombre = "Suspensos", Valor = totalSuspensos, ValorDecimal = 0, Asignatura = "" }
    };

            // 5. Retorno: Añadido campo obligatorio AsignaturasMatriculadas
            return Ok(new DashboardStats
            {
                TotalAlumnos = totalAlumnos,
                TotalAsignaturas = totalAsignaturas,
                EdadMediaGlobal = Math.Round(edadMedia, 1),
                AlumnosPorAsignatura = alumnosPorAsignatura,
                DistribucionEdades = distribucionEdades,
                NotaMediaPorAsignatura = notasPorAsignatura,
                AprobadosVsSuspensos = aprobadosVsSuspensos,
                AsignaturasMatriculadas = new List<DatoGrafica>() // ✨ Requerido por el DTO
            });
        }
    }
}


