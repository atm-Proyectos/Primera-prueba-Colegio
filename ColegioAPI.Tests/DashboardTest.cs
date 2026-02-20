using Xunit;
using Microsoft.EntityFrameworkCore;
using ColegioAPI.Controllers;
using ColegioAPI.Data;
using ColegioAPI.models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using System.Threading.Tasks;
using System;
using System.Collections.Generic;
using System.Linq;

namespace ColegioAPI.Tests
{
    public class DashboardTest
    {
        // --- ⚙️ CONFIGURACIÓN DE APOYO ---

        /// <summary>
        /// Crea un contexto de base de datos en memoria único para cada test.
        /// </summary>
        private AppDbContext GetDatabaseContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            var context = new AppDbContext(options);
            context.Database.EnsureCreated();
            return context;
        }

        /// <summary>
        /// Simula un contexto de seguridad (usuario logueado) para el controlador.
        /// </summary>
        private void SimularUsuario(ControllerBase controller, string nombre, string rol)
        {
            var identity = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.Name, nombre),
                new Claim(ClaimTypes.Role, rol)
            }, "TestAuthType");

            var user = new ClaimsPrincipal(identity);

            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };
        }

        // --- 🧪 TESTS UNITARIOS ---

        [Fact]
        public async Task GetDashboard_DeberiaDevolverLista_CuandoExistenDatos()
        {
            // 1. Arrange 🏗️
            var context = GetDatabaseContext();
            context.Asignaturas.Add(new Asignaturas
            {
                Id = 0,
                Clase = "Matemáticas",
                Profesor = "Newton",
                AsignaturaAlumnos = []
            });
            await context.SaveChangesAsync();

            var controller = new AsignaturasController(context);
            // Inyectamos un Admin para que el filtro 'User.IsInRole' no falle 🛡️
            SimularUsuario(controller, "AdminTest", "Admin");

            // 2. Act 🎬
            var respuesta = await controller.GetAsignaturas();

            // 3. Assert ✅
            var okResult = Assert.IsType<OkObjectResult>(respuesta.Result);
            var lista = Assert.IsAssignableFrom<IEnumerable<AsignaturaDTO>>(okResult.Value);
            Assert.Single(lista);
        }
        [Fact]
        public async Task GetStatsAdmin_DeberiaCalcularLaEdadMediaCorrectamente()
        {
            // 1. Arrange 🏗️
            var context = GetDatabaseContext(); // Usamos nuestro helper de siempre

            // Añadimos dos alumnos con edades conocidas
            context.Alumnos.Add(new Alumnos
            {
                Id = 1,
                Nombre = "Alumno A",
                Apellido = "Uno",
                Edad = 10,
                AsignaturaAlumnos = []
            });
            context.Alumnos.Add(new Alumnos
            {
                Id = 2,
                Nombre = "Alumno B",
                Apellido = "Dos",
                Edad = 20,
                AsignaturaAlumnos = []
            });
            await context.SaveChangesAsync();

            var controller = new StatsController(context);
            SimularUsuario(controller, "AdminTest", "Admin");

            // 2. Act 🎬
            var respuesta = await controller.GetStatsAdmin();

            // 3. Assert ✅
            var okResult = Assert.IsType<OkObjectResult>(respuesta.Result);
            var stats = Assert.IsType<ColegioAPI.models.DashboardStats>(okResult.Value);

            // Verificamos el conteo total
            Assert.Equal(2, stats.TotalAlumnos);

            // La media de 10 y 20 es 15.0
            Assert.Equal(15.0, stats.EdadMediaGlobal);
        }
        [Fact]
        public async Task GetStatsAdmin_DeberiaContarSuspensosCorrectamente()
        {
            // 1. Arrange 🏗️
            var context = GetDatabaseContext();

            // Creamos los datos base (incluyendo las listas requeridas)
            var alumno = new Alumnos { Id = 1, Nombre = "Pedro", Apellido = "García", Edad = 12, AsignaturaAlumnos = [] };
            var asignatura = new Asignaturas { Id = 1, Clase = "Arte", Profesor = "Dali", AsignaturaAlumnos = [] };
            context.Alumnos.Add(alumno);
            context.Asignaturas.Add(asignatura);
            await context.SaveChangesAsync();

            // Creamos la matrícula que vincula al alumno con la asignatura
            var matricula = new AsignaturaAlumno
            {
                Id = 1,
                AlumnoId = 1,
                AsignaturaId = 1,
                AñoEscolar = 2024,
                FechaMatricula = DateTime.Now
            };
            context.Asignatura_Alumnos.Add(matricula);
            await context.SaveChangesAsync();

            var nota = new Notas
            {
                Id = 1,
                AsignaturaAlumnoId = 1,
                AsignaturaAlumno = null,
                Valor = 4.0m
            };
            context.Notas.Add(nota);
            await context.SaveChangesAsync();

            var controller = new StatsController(context);
            SimularUsuario(controller, "AdminTest", "Admin");

            // 2. Act 🎬
            var respuesta = await controller.GetStatsAdmin();

            // 3. Assert ✅
            var okResult = Assert.IsType<OkObjectResult>(respuesta.Result);
            var stats = Assert.IsType<ColegioAPI.models.DashboardStats>(okResult.Value);

            // Buscamos el objeto de "Suspensos" dentro de la lista de la gráfica 📈
            var datoSuspenso = stats.AprobadosVsSuspensos
                  .FirstOrDefault(x => x.Nombre == "Suspensos");

            // Verificamos que el objeto exista y que el valor sea 1
            Assert.NotNull(datoSuspenso);
            Assert.Equal(1, datoSuspenso.Valor);
        }
    }

}