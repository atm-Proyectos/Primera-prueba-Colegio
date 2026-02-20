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
                // ✅ Estructura general en PascalCase
                TotalAsignaturas = alumno.AsignaturaAlumnos!.Count,
                PromedioGlobal = matriculasConNota.Any()
                    ? Math.Round(matriculasConNota.Average(aa => (double)aa.Notas!.Valor), 2)
                    : 0,
                Aprobadas = aprobadas,
                Suspensas = suspensas,
                SinCalificar = sinCalificar,

                // 🎯 SOLUCIÓN GRÁFICOS: name y value en minúsculas
                StatsTarta = new[] {
                    new { name = "Aprobadas", value = aprobadas },
                    new { name = "Suspensas", value = suspensas },
                    new { name = "Sin Calificar", value = sinCalificar }
                },
                GraficaNotas = matriculasConNota.Select(aa => new
                {
                    name = aa.Asignatura?.Clase ?? "Asignatura",
                    value = aa.Notas!.Valor
                }),

                // Lista de la tabla inferior
                Asignaturas = alumno.AsignaturaAlumnos.Select(aa => new
                {
                    Nombre = aa.Asignatura?.Clase,
                    Clase = aa.Asignatura?.Clase,
                    Profesor = aa.Asignatura?.Profesor,
                    Nota = aa.Notas?.Valor.ToString() ?? "Sin calificar"
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
                    Id = m.Id,
                    Nombre = m.Alumno != null ? $"{m.Alumno.Nombre} {m.Alumno.Apellido}" : "Sin nombre",
                    Asignatura = m.Asignatura?.Clase ?? "N/A"
                }).ToList();

            var mejorNotaObj = misNotas.OrderByDescending(n => n.Valor).FirstOrDefault();
            var peorNotaObj = misNotas.OrderBy(n => n.Valor).FirstOrDefault();

            // 🚀 RESPUESTA FINAL: Usamos camelCase y propiedades name/value para las gráficas
            return Ok(new
            {
                TotalAlumnos = misMatriculas.Select(m => m.AlumnoId).Distinct().Count(),
                TotalAsignaturas = misAsignaturas.Count,

                MejorAlumno = new
                {
                    Id = mejorNotaObj?.Id ?? 0,
                    Nombre = mejorNotaObj?.AsignaturaAlumno?.Alumno != null ? $"{mejorNotaObj.AsignaturaAlumno.Alumno.Nombre} {mejorNotaObj.AsignaturaAlumno.Alumno.Apellido}" : "N/A",
                    Valor = mejorNotaObj?.Valor ?? 0m
                },
                PeorAlumno = new
                {
                    Id = peorNotaObj?.Id ?? 0,
                    Nombre = peorNotaObj?.AsignaturaAlumno?.Alumno != null ? $"{peorNotaObj.AsignaturaAlumno.Alumno.Nombre} {peorNotaObj.AsignaturaAlumno.Alumno.Apellido}" : "N/A",
                    Valor = peorNotaObj?.Valor ?? 0m
                },

                AlumnosEnRiesgo = misNotas.Where(n => n.Valor < 5).Select(n => new
                {
                    Id = n.Id,
                    Nombre = n.AsignaturaAlumno?.Alumno != null ? $"{n.AsignaturaAlumno.Alumno.Nombre} {n.AsignaturaAlumno.Alumno.Apellido}" : "Desconocido",
                    Valor = n.Valor
                }).Take(5).ToList(),

                AprobadosVsSuspensos = new[] {
            new { name = "Aprobados", value = misNotas.Count(n => n.Valor >= 5) },
            new { name = "Suspensos", value = misNotas.Count(n => n.Valor < 5) },
            new { name = "Sin Calificar", value = pendientesData.Count }
        },

                Pendientes = pendientesData,
                ProgresoCorreccion = new[] {
            new { name = "Evaluados", value = misNotas.Count },
            new { name = "Pendientes", value = pendientesData.Count }
        },
                AlumnosPorAsignatura = misAsignaturas.Select(a => new
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
        public async Task<ActionResult<object>> GetStatsAdmin()
        {
            var TotalAlumnos = await _context.Alumnos.CountAsync();
            var TotalAsignaturas = await _context.Asignaturas.CountAsync();

            var alumnos = await _context.Alumnos.ToListAsync();
            double EdadMedia = TotalAlumnos > 0 ? alumnos.Average(a => (double)a.Edad) : 0;

            // 1. Popularidad: Corregido a Mayúsculas y campos required
            var AlumnosPorAsignatura = await _context.Asignatura_Alumnos
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
            var DistribucionEdades = alumnos
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
            var NotasPorAsignatura = await _context.Notas
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
            var TotalAprobados = await _context.Notas.CountAsync(n => n.Valor >= 5);
            var TotalSuspensos = await _context.Notas.CountAsync(n => n.Valor < 5);
            var AprobadosVsSuspensos = new List<DatoGrafica>
    {
        new DatoGrafica { Nombre = "Aprobados", Valor = TotalAprobados, ValorDecimal = 0, Asignatura = "" },
        new DatoGrafica { Nombre = "Suspensos", Valor = TotalSuspensos, ValorDecimal = 0, Asignatura = "" }
    };

            // 5. Retorno: Añadido campo obligatorio AsignaturasMatriculadas
            return Ok(new
            {
                TotalAlumnos = TotalAlumnos,
                TotalAsignaturas = TotalAsignaturas,
                EdadMediaGlobal = Math.Round(EdadMedia, 1),
                AlumnosPorAsignatura = AlumnosPorAsignatura.Select(g => new { name = g.Nombre, value = g.Valor }),
                DistribucionEdades = DistribucionEdades.Select(g => new { name = g.Nombre, value = g.Valor }),
                MediaPorAsignatura = NotasPorAsignatura.Select(g => new { name = g.Nombre, value = g.Valor }),
                AprobadosVsSuspensos = AprobadosVsSuspensos.Select(g => new { name = g.Nombre, value = g.Valor }),
                AsignaturasMatriculadas = new List<DatoGrafica>() // ✨ Requerido por el DTO
            });
        }
    }
}


